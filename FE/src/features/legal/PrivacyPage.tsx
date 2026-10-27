import { LEGAL } from './legal'
import { LegalPage } from './LegalPage'

const PROVIDERS = [
  { who: 'Render', why: 'ospita sito, server e database', gets: 'i dati dell\'app, per intero', where: 'Stati Uniti' },
  { who: 'Brevo', why: 'invia l\'email per reimpostare la password', gets: 'il tuo indirizzo email e il link', where: 'Unione europea (Francia)' },
  { who: 'Anthropic', why: 'consigli per il viaggio e per la valigia', gets: 'destinazione, date, numero di persone, meteo e le voci già in lista; mai nomi, email o importi', where: 'Stati Uniti' },
  { who: 'Open-Meteo', why: 'meteo e proposte di luoghi', gets: 'per il meteo, le coordinate della destinazione, inviate dal tuo browser (quindi con il tuo indirizzo IP, come per qualsiasi sito); per i luoghi, il testo cercato, inviato dal nostro server', where: 'Svizzera' },
  { who: 'Frankfurter', why: 'cambi del giorno della Banca centrale europea', gets: 'data e valute, inviate dal nostro server', where: 'non riceve dati personali' },
  { who: 'OpenStreetMap', why: 'immagini della mappa', gets: 'il tuo indirizzo IP e il tipo di browser, perché il browser le scarica direttamente', where: 'Regno Unito' },
  { who: 'Google Fonts', why: 'caratteri del testo e icone', gets: 'il tuo indirizzo IP e il tipo di browser, perché il browser li scarica direttamente', where: 'Stati Uniti' },
]

/** Informativa sulla privacy (art. 13 GDPR), con il paragrafo su cookie e memoria del dispositivo (D-72). */
export function PrivacyPage() {
  return (
    <LegalPage title="Informativa sulla privacy">
      <h2>Chi tratta i dati</h2>
      <p>Titolare del trattamento: {LEGAL.owner}. Contatto: <strong>{LEGAL.contact}</strong>.</p>
      <p className="muted">
        SplitTrip è un progetto didattico: {LEGAL.contact} è un indirizzo di esempio, che sarà sostituito da un recapito
        reale se il servizio resterà online dopo la valutazione del progetto.
      </p>

      <h2>Quali dati</h2>
      <ul>
        <li><strong>Account:</strong> nome, email e password, salvata solo come hash non reversibile (bcrypt), e la data e ora in cui hai accettato i Termini e condizioni.</li>
        <li><strong>Profilo:</strong> foto (facoltativa) e preferenze: valuta, tema, suono, animazioni.</li>
        <li><strong>Viaggi:</strong> nome, destinazione, date, persone del gruppo (anche chi non ha un account, con il nome scelto dal gruppo), giorni di presenza e quote.</li>
        <li><strong>Spese e rimborsi:</strong> importi, valute, cambi, categorie, note, chi ha pagato e per chi.</li>
        <li><strong>Foto e scontrini:</strong> il server riscrive ogni immagine e toglie i metadati (modello del telefono, data, posizione). La posizione di una foto si salva solo se chi la carica lo sceglie, foto per foto.</li>
        <li><strong>Liste, chat e giochi:</strong> voci delle liste, messaggi e reazioni, notifiche, l'ipotesi di «Indovina il totale».</li>
        <li><strong>Dati tecnici:</strong> l'indirizzo IP serve a limitare i tentativi ripetuti, resta solo nella memoria del server per il tempo del controllo e può comparire nei registri tecnici del fornitore di hosting.</li>
      </ul>
      <p>La tua email non è mostrata alle persone dei tuoi viaggi; nome e foto profilo sì.</p>

      <h2>Perché e su quale base</h2>
      <ul>
        <li><strong>Fornire il servizio</strong> che chiedi registrandoti: account, viaggi, conti, foto, chat, notifiche, email per reimpostare la password (art. 6.1.b GDPR, esecuzione del contratto).</li>
        <li><strong>Proteggere il servizio</strong> da abusi: limiti ai tentativi e registri tecnici (art. 6.1.f, legittimo interesse).</li>
        <li><strong>Posizione delle foto:</strong> solo con il tuo consenso, foto per foto (art. 6.1.a); lo revochi eliminando la foto.</li>
      </ul>
      <p>Niente pubblicità, niente profilazione, nessuna vendita dei dati e nessuna decisione automatizzata su di te.</p>

      <h2>A chi arrivano</h2>
      <p>Le persone dei tuoi viaggi vedono quello che condividi nel viaggio. Per funzionare SplitTrip usa questi fornitori:</p>
      <div className="legal-table" role="region" aria-label="Fornitori, scorre di lato" tabIndex={0}>
        <table>
          <thead><tr><th scope="col">Fornitore</th><th scope="col">A cosa serve</th><th scope="col">Cosa riceve</th><th scope="col">Dove</th></tr></thead>
          <tbody>
            {PROVIDERS.map((p) => <tr key={p.who}><th scope="row">{p.who}</th><td>{p.why}</td><td>{p.gets}</td><td>{p.where}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p>Le voci delle liste sono testo scritto dal gruppo e possono arrivare al servizio dei consigli: evitate di scriverci dati personali.</p>

      <h2>Fuori dall’Unione europea</h2>
      <p>
        Render, Anthropic e Google hanno sede negli Stati Uniti; il server e il database di SplitTrip si trovano negli
        Stati Uniti. I trasferimenti avvengono con le garanzie previste dagli articoli 45 e 46 del GDPR offerte dai
        fornitori, come le clausole contrattuali standard o l'adesione all'EU-U.S. Data Privacy Framework. Il Regno Unito
        e la Svizzera hanno una decisione di adeguatezza della Commissione europea.
      </p>

      <h2>Per quanto tempo</h2>
      <ul>
        <li>I dati restano finché esiste l'account. Le spese e i rimborsi eliminati restano nel cestino del viaggio, per poterli ripristinare.</li>
        <li>Il link per reimpostare la password scade dopo 30 minuti e funziona una volta sola.</li>
        <li>Per ora non c'è un pulsante per eliminare l'account: la cancellazione si chiede al contatto indicato sopra.</li>
        <li>Se il servizio viene chiuso, i dati vengono cancellati.</li>
      </ul>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere l'accesso ai tuoi dati, la correzione (nome ed email si cambiano anche dal profilo), la cancellazione,
        la limitazione, la portabilità e opporti al trattamento basato sul legittimo interesse. Puoi anche presentare un
        reclamo al <a href="https://www.garanteprivacy.it">Garante per la protezione dei dati personali</a>.
      </p>

      <h2>Cookie e memoria del dispositivo</h2>
      <p>SplitTrip non usa cookie, né di profilazione né di statistica. Sul dispositivo salva solo dati tecnici necessari a farlo funzionare:</p>
      <ul>
        <li>la sessione e le preferenze (memoria locale del browser);</li>
        <li>l'ultima valuta usata in ogni viaggio;</li>
        <li>la copia dei dati per la consultazione offline (IndexedDB);</li>
        <li>l'app, i caratteri e le immagini già viste (cache del service worker).</li>
      </ul>
      <p>
        Sono strumenti tecnici, quindi non serve il consenso e non c'è un banner (art. 122 del Codice privacy e linee guida
        del Garante del 10 giugno 2021). Uscendo dall'account si cancellano sessione, copia offline e immagini; il resto si
        toglie dalle impostazioni del browser.
      </p>

      <h2>Minori</h2>
      <p>SplitTrip è pensato per persone dai 14 anni in su.</p>
    </LegalPage>
  )
}
