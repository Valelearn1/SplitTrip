#!/usr/bin/env node
/**
 * Dati di esempio per la presentazione: un viaggio in corso a Lisbona e uno finito a Tokyo, con spese (anche in yen),
 * rimborsi, liste, chat, reazioni, ipotesi di «Indovina il totale» e, se si vuole, foto.
 *
 *   node scripts/demo-seed.mjs <indirizzo-api> [--io tua@email] [--foto <cartella>]
 *
 *   <indirizzo-api>  es. http://localhost:8080 oppure https://splittrip-api.onrender.com
 *   --io <email>     il tuo account organizza i viaggi (la password si chiede qui, nascosta, e non si salva);
 *                    senza, li organizza l'account di prova «Ada»
 *   --foto <dir>     JPEG da caricare: <dir>/lisbona/*.jpg e <dir>/tokyo/*.jpg (facoltativo)
 *   --forza          crea i viaggi anche se quelli di un giro precedente esistono ancora (verranno doppi)
 *
 * Le password degli account di prova si creano la prima volta e restano in docs/demo/.account-demo.json (fuori da git),
 * con gli id dei viaggi creati. Un viaggio con spese non si può cancellare: le date sono fisse (Lisbona 25 ottobre –
 * 1 novembre, Tokyo 1–8 ottobre), quindi basta lanciarlo una volta; rilanciato, si ferma invece di creare doppioni.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

const args = process.argv.slice(2);
const api = (
  args.find((a) => !a.startsWith("--") && !isOptionValue(a)) ?? ""
).replace(/\/$/, "");
const meEmail = option("--io");
const photosDir = option("--foto");
const force = args.includes("--forza");
if (!/^https?:\/\//.test(api)) {
  console.error(
    "Uso: node scripts/demo-seed.mjs <indirizzo-api> [--io valentina-ferro@hotmail.it] [--foto <cartella>]",
  );
  process.exit(1);
}

function option(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
function isOptionValue(a) {
  const i = args.indexOf(a);
  return i > 0 && args[i - 1].startsWith("--");
}

const STATE_FILE = resolve(
  import.meta.dirname,
  "../docs/demo/.account-demo.json",
);
const state = existsSync(STATE_FILE)
  ? JSON.parse(readFileSync(STATE_FILE, "utf8"))
  : {};
const here = (state[api] ??= { accounts: {}, trips: [] });
const save = () =>
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");

// ---------- chiamate all'API ----------

async function call(method, path, token, body) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(api + path, { method, headers, body: payload });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;
  if (!res.ok) {
    const err = new Error(
      `${method} ${path} → ${res.status} ${typeof data === "object" && data ? (data.detail ?? data.title ?? "") : data}`,
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

const password = () => `Demo-${randomBytes(9).toString("base64url")}7`;

/** Account di prova: registrazione la prima volta, poi accesso con la password salvata. */
async function demoAccount(key, displayName) {
  let acc = here.accounts[key];
  if (!acc) {
    acc = {
      email: `${key}.demo@splittrip.test`,
      password: password(),
      displayName,
    };
    try {
      const r = await call("POST", "/api/auth/register", null, {
        email: acc.email,
        password: acc.password,
        displayName,
        acceptedTerms: true, // D-73: chi lancia lo script accetta i termini per gli account di esempio
      });
      here.accounts[key] = acc;
      save();
      return { ...acc, token: r.token, userId: r.user.id };
    } catch (e) {
      if (e.status !== 409) throw e;
      throw new Error(
        `${acc.email} esiste già ma la sua password non è in ${STATE_FILE}: cambia l'email o recupera il file`,
      );
    }
  }
  const r = await call("POST", "/api/auth/login", null, {
    email: acc.email,
    password: acc.password,
  });
  return { ...acc, token: r.token, userId: r.user.id };
}

/** Il tuo account: la password si chiede nel terminale senza mostrarla e non si salva. */
async function myAccount(email) {
  const pwd = await askHidden(`Password di ${email}: `);
  const r = await call("POST", "/api/auth/login", null, {
    email,
    password: pwd,
  });
  return {
    email,
    token: r.token,
    userId: r.user.id,
    displayName: r.user.displayName,
  };
}

function askHidden(question) {
  return new Promise((done) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    rl._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      done(answer);
    });
  });
}

// ---------- aiuti per i viaggi ----------

async function tripOf(token, id) {
  return call("GET", `/api/trips/${id}`, token);
}
const pid = (trip, name) => {
  const p = trip.participants.find((x) => x.displayName === name);
  if (!p) throw new Error(`Nel viaggio «${trip.name}» manca ${name}`);
  return p.id;
};

async function expense(token, tripId, e) {
  const body = {
    description: e.description,
    amount: e.amount,
    currency: e.currency,
    fxRate: e.fxRate,
    date: e.date,
    category: e.category,
    payerId: e.payerId,
    splitType: e.splitType ?? "EQUAL",
    dayBasis: e.dayBasis,
    shares: e.shares,
  };
  return call("POST", `/api/trips/${tripId}/expenses`, token, body);
}
const equal = (...ids) => ids.map((participantId) => ({ participantId }));

/** Cambio BCE del giorno dal backend (D-69); se il servizio non risponde, uno fisso realistico. */
async function rate(token, from, to, date, fallback) {
  try {
    return (
      await call("GET", `/api/rates?from=${from}&to=${to}&date=${date}`, token)
    ).rate;
  } catch {
    return fallback;
  }
}

async function chat(token, tripId, content) {
  return call("POST", `/api/trips/${tripId}/messages`, token, { content });
}
async function react(token, tripId, messageId, emoji) {
  return call(
    "POST",
    `/api/trips/${tripId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
    token,
  );
}

async function uploadPhotos(token, tripId, dir, places) {
  if (!dir || !existsSync(dir)) return 0;
  const files = readdirSync(dir)
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();
  for (const [i, f] of files.entries()) {
    const place = places[i % places.length];
    const form = new FormData();
    form.append(
      "file",
      new Blob([readFileSync(join(dir, f))], { type: "image/jpeg" }),
      f,
    );
    form.append("placeName", place.name);
    form.append("latitude", String(place.lat));
    form.append("longitude", String(place.lon));
    await call("POST", `/api/trips/${tripId}/photos`, token, form);
  }
  return files.length;
}

// ---------- i dati ----------

async function main() {
  console.log(`SplitTrip demo → ${api}`);
  const lead = meEmail
    ? await myAccount(meEmail)
    : await demoAccount("ada", "Ada");
  const bruno = await demoAccount("bruno", "Bruno");
  const chiara = await demoAccount("chiara", "Chiara");
  const dario = await demoAccount("dario", "Dario");

  // viaggi di un giro precedente: se ci sono ancora ci si ferma, niente doppioni (un viaggio con spese non si cancella)
  const existing = [];
  for (const id of here.trips) {
    try {
      existing.push((await tripOf(lead.token, id)).name);
    } catch (e) {
      if (e.status !== 404 && e.status !== 403) throw e;
    }
  }
  if (existing.length > 0 && !force) {
    console.log(
      `I viaggi di prova ci sono già: ${existing.join(", ")}. Niente da fare (con --forza si creano di nuovo, doppi).`,
    );
    return;
  }
  here.trips = [];
  save();

  const lisbona = await seedLisbon(lead, bruno, chiara, dario);
  const tokyo = await seedTokyo(lead, bruno, chiara);

  console.log("\nFatto.");
  console.log(`  Lisbona (in corso): /trips/${lisbona}`);
  console.log(`  Tokyo (finito, riepilogo pronto): /trips/${tokyo}/riepilogo`);
  console.log(
    `  Accedi come ${lead.email}${meEmail ? "" : ` (password in ${STATE_FILE})`}`,
  );
  console.log(
    `  Account di prova: ${[bruno, chiara, dario].map((a) => a.email).join(", ")} (password nello stesso file)`,
  );
}

async function newTrip(lead, body, members) {
  const t = await call("POST", "/api/trips", lead.token, body);
  here.trips.push(t.id);
  save();
  for (const m of members)
    await call("POST", "/api/trips/join", m.token, { code: t.inviteCode });
  return t;
}

async function seedLisbon(lead, bruno, chiara, dario) {
  const t = await newTrip(
    lead,
    {
      name: "Lisbona in compagnia",
      destination: "Lisbona",
      startDate: "2026-10-25",
      endDate: "2026-11-01",
      currency: "EUR",
      latitude: 38.7169,
      longitude: -9.1399,
    },
    [bruno, chiara, dario],
  );
  const id = t.id;
  await call("POST", `/api/trips/${id}/participants`, lead.token, {
    displayName: "Zia Carla",
  });
  let trip = await tripOf(lead.token, id);
  const me = trip.participants.find((p) => p.userId === lead.userId).id;
  const B = pid(trip, "Bruno"),
    C = pid(trip, "Chiara"),
    D = pid(trip, "Dario"),
    Z = pid(trip, "Zia Carla");
  // Chiara arriva martedì (D-31); il «conta per» non c'è più (D-75): Dario conta per uno come gli altri
  await call("PATCH", `/api/trips/${id}/participants/${C}`, lead.token, {
    arrivalDate: "2026-10-27",
  });
  await call("PATCH", `/api/trips/${id}`, lead.token, { status: "ONGOING" });

  const weighted = (w) =>
    Object.entries(w).map(([participantId, weight]) => ({
      participantId,
      weight,
    }));
  await expense(lead.token, id, {
    description: "Appartamento ad Alfama",
    amount: 840,
    date: "2026-10-25",
    category: "LODGING",
    payerId: me,
    splitType: "DAYS",
    dayBasis: "NIGHTS",
    shares: weighted({ [me]: 7, [B]: 7, [C]: 5, [D]: 14 }),
  });
  await expense(bruno.token, id, {
    description: "Cena al Bairro Alto",
    amount: 156,
    date: "2026-10-25",
    category: "FOOD",
    payerId: B,
    shares: equal(me, B, D, Z),
  });
  await expense(lead.token, id, {
    description: "Spesa al mercato",
    amount: 64.3,
    date: "2026-10-26",
    category: "FOOD",
    payerId: me,
    splitType: "CUSTOM",
    shares: [
      { participantId: me, amount: 20 },
      { participantId: B, amount: 14.3 },
      { participantId: D, amount: 30 },
    ],
  });
  await expense(dario.token, id, {
    description: "Gita a Sintra",
    amount: 120,
    date: "2026-10-26",
    category: "ACTIVITY",
    payerId: D,
    splitType: "WEIGHT",
    shares: weighted({ [me]: 1, [B]: 1, [D]: 2 }),
  });
  await expense(chiara.token, id, {
    description: "Biglietti del tram 28",
    amount: 36,
    date: "2026-10-27",
    category: "TRANSPORT",
    payerId: C,
    shares: equal(me, B, C, D),
  });
  await expense(dario.token, id, {
    description: "Pastéis de Belém",
    amount: 18.6,
    date: "2026-10-27",
    category: "FOOD",
    payerId: D,
    shares: equal(me, B, C, D, Z),
  });
  await expense(lead.token, id, {
    description: "Vinho verde",
    amount: 24,
    date: "2026-10-27",
    category: "FOOD",
    payerId: Z,
    shares: equal(me, B, C, Z),
  });
  await expense(chiara.token, id, {
    description: "Serata di fado",
    amount: 90,
    date: "2026-10-28",
    category: "ACTIVITY",
    payerId: C,
    shares: equal(me, B, C),
  });
  await call("POST", `/api/trips/${id}/settlements`, dario.token, {
    fromParticipantId: D,
    toParticipantId: me,
    amount: 150,
    date: "2026-10-27",
    note: "Parte dell'appartamento",
  });

  const valigia = await call(
    "POST",
    `/api/trips/${id}/todo-lists`,
    lead.token,
    { title: "Valigia", type: "PACKING" },
  );
  for (const [text, done, who] of [
    ["Crema solare", true],
    ["Scarpe comode", true],
    ["Carta d'identità", false],
    ["Caricabatterie", false, B],
    ["Ombrello", false, C],
  ]) {
    const item = await call(
      "POST",
      `/api/trips/${id}/todo-lists/${valigia.id}/items`,
      lead.token,
      { text, assigneeParticipantId: who },
    );
    if (done)
      await call(
        "PATCH",
        `/api/trips/${id}/todo-lists/${valigia.id}/items/${item.id}`,
        lead.token,
        { done: true },
      );
  }
  const vedere = await call("POST", `/api/trips/${id}/todo-lists`, lead.token, {
    title: "Da vedere",
    type: "GENERAL",
  });
  for (const text of [
    "Torre di Belém",
    "LX Factory",
    "Miradouro da Senhora do Monte",
  ]) {
    await call(
      "POST",
      `/api/trips/${id}/todo-lists/${vedere.id}/items`,
      lead.token,
      { text },
    );
  }

  const m1 = await chat(
    lead.token,
    id,
    "Ci siamo! L'appartamento è ad Alfama, a due passi dal tram 28 🏠",
  );
  const m2 = await chat(
    bruno.token,
    id,
    "Domani Sintra? I biglietti del treno li prendo io",
  );
  const m3 = await chat(
    chiara.token,
    id,
    "Io arrivo martedì sera ✈️ tenetemi un pastel de nata",
  );
  const m4 = await chat(dario.token, id, "Stasera fado: ho prenotato per tre");
  await react(bruno.token, id, m1.id, "❤️");
  await react(dario.token, id, m1.id, "🎉");
  await react(lead.token, id, m2.id, "👍");
  await react(dario.token, id, m3.id, "😂");
  await react(chiara.token, id, m4.id, "🎉");

  const n = await uploadPhotos(
    lead.token,
    id,
    photosDir && join(photosDir, "lisbona"),
    [
      { name: "Alfama", lat: 38.7112, lon: -9.1277 },
      { name: "Belém", lat: 38.6979, lon: -9.2065 },
      { name: "Sintra", lat: 38.7978, lon: -9.3906 },
      { name: "Bairro Alto", lat: 38.7134, lon: -9.1446 },
    ],
  );
  console.log(
    `  Lisbona: 8 spese, 1 rimborso, 2 liste, chat${n ? `, ${n} foto` : ""}`,
  );
  return id;
}

async function seedTokyo(lead, bruno, chiara) {
  const t = await newTrip(
    lead,
    {
      name: "Tokyo e Kyoto",
      destination: "Tokyo",
      startDate: "2026-10-01",
      endDate: "2026-10-08",
      currency: "EUR",
      latitude: 35.6762,
      longitude: 139.6503,
    },
    [bruno, chiara],
  );
  const id = t.id;
  const trip = await tripOf(lead.token, id);
  const me = trip.participants.find((p) => p.userId === lead.userId).id;
  const B = pid(trip, "Bruno"),
    C = pid(trip, "Chiara");

  const yen = async (token, e) =>
    expense(token, id, {
      ...e,
      currency: "JPY",
      fxRate: await rate(token, "JPY", "EUR", e.date, 0.0057),
    });
  await yen(chiara.token, {
    description: "Japan Rail Pass",
    amount: 150000,
    date: "2026-10-01",
    category: "TRANSPORT",
    payerId: C,
    shares: equal(me, B, C),
  });
  await yen(bruno.token, {
    description: "Sushi a Tsukiji",
    amount: 12600,
    date: "2026-10-02",
    category: "FOOD",
    payerId: B,
    shares: equal(me, B, C),
  });
  await yen(lead.token, {
    description: "Ryokan a Kyoto",
    amount: 96000,
    date: "2026-10-03",
    category: "LODGING",
    payerId: me,
    shares: equal(me, B, C),
  });
  await yen(bruno.token, {
    description: "Biglietti teamLab",
    amount: 11400,
    date: "2026-10-04",
    category: "ACTIVITY",
    payerId: B,
    shares: equal(me, B, C),
  });
  await yen(lead.token, {
    description: "Ramen a Shinjuku",
    amount: 4200,
    date: "2026-10-05",
    category: "FOOD",
    payerId: me,
    shares: equal(me, B, C),
  });
  await yen(chiara.token, {
    description: "Taxi notturno",
    amount: 3800,
    date: "2026-10-06",
    category: "TRANSPORT",
    payerId: C,
    shares: equal(me, C),
  });
  await yen(lead.token, {
    description: "Souvenir ad Asakusa",
    amount: 8000,
    date: "2026-10-07",
    category: "OTHER",
    payerId: me,
    splitType: "CUSTOM",
    shares: [
      { participantId: me, amount: 5000 },
      { participantId: B, amount: 3000 },
    ],
  });
  await expense(bruno.token, id, {
    description: "eSIM per tutti",
    amount: 27,
    date: "2026-10-01",
    category: "OTHER",
    payerId: B,
    shares: equal(me, B, C),
  });
  const fx = await rate(bruno.token, "JPY", "EUR", "2026-10-08", 0.0057);
  await call("POST", `/api/trips/${id}/settlements`, bruno.token, {
    fromParticipantId: B,
    toParticipantId: me,
    amount: 20000,
    currency: "JPY",
    fxRate: fx,
    date: "2026-10-08",
    note: "In contanti, all'aeroporto",
  });

  const m1 = await chat(chiara.token, id, "Il Rail Pass è attivo da domani 🚄");
  const m2 = await chat(
    bruno.token,
    id,
    "Il sushi delle 6 del mattino vale la sveglia",
  );
  await chat(lead.token, id, "Ultima sera: chi offre il sakè?");
  await react(lead.token, id, m1.id, "👍");
  await react(chiara.token, id, m2.id, "😂");
  await react(lead.token, id, m2.id, "❤️");

  const n = await uploadPhotos(
    lead.token,
    id,
    photosDir && join(photosDir, "tokyo"),
    [
      { name: "Shibuya", lat: 35.6595, lon: 139.7005 },
      { name: "Fushimi Inari", lat: 34.9671, lon: 135.7727 },
      { name: "Asakusa", lat: 35.7148, lon: 139.7967 },
      { name: "Arashiyama", lat: 35.0094, lon: 135.6668 },
    ],
  );
  // «Indovina il totale»: Bruno e Chiara hanno già giocato; l'ipotesi di chi presenta resta per la demo
  await call("POST", `/api/trips/${id}/wrapped/guess`, bruno.token, {
    amount: 1500,
  });
  await call("POST", `/api/trips/${id}/wrapped/guess`, chiara.token, {
    amount: 1900,
  });
  await call("PATCH", `/api/trips/${id}`, lead.token, { status: "CLOSED" });
  console.log(
    `  Tokyo: 7 spese in yen e 1 in euro, 1 rimborso in yen, chat, 2 ipotesi${n ? `, ${n} foto` : ""}, chiuso`,
  );
  return id;
}

main().catch((e) => {
  console.error(`\nErrore: ${e.message}`);
  process.exit(1);
});
