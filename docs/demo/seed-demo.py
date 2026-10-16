#!/usr/bin/env python3
"""
Dati di prova per la demo di SplitTrip (presentazione del capstone).

Crea tre account demo (Vale, Marco, Giulia) e:
  • «Lisbona 2026», in corso (iniziato due giorni fa, finisce tra tre): casa ad Alfama divisa per notti,
    cena con Marco che conta per 2 e Nonna Pina senza account che conta per ½, tram, pastéis, un rimborso,
    la valigia, la chat con reazioni e, se le passi, foto con il luogo;
  • «Berlino», chiuso a maggio, con le sue spese: è il viaggio da raccontare nel riepilogo finale.

Uso (dalla cartella del repository):
  DEMO_PASSWORD='scegli-una-password1' python3 docs/demo/seed-demo.py [--foto cartella_con_jpg]

  • DEMO_PASSWORD  obbligatoria: almeno 8 caratteri con una lettera e una cifra; vale per i tre account.
  • SPLITTRIP_API  facoltativa: di base il backend su Render; per provare in locale http://localhost:8080/api
  • --foto         facoltativa: fino a 4 .jpg, caricati in Lisbona con un luogo ciascuno.

Ogni esecuzione crea account nuovi (email con un suffisso diverso): si può rilanciare la mattina della demo,
così le date di «Lisbona» sono quelle giuste. Alla fine stampa le email per entrare (la password è quella scelta).
"""
import argparse
import datetime as dt
import json
import mimetypes
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = os.environ.get('SPLITTRIP_API', 'https://splittrip-api.onrender.com/api').rstrip('/')
ROOT = API.removesuffix('/api')
PASSWORD = os.environ.get('DEMO_PASSWORD', '')


def call(method, path, body=None, token=None, raw=None, content_type='application/json'):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    headers = {'Content-Type': content_type} if data is not None else {}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(API + path, method=method, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            text = r.read()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        sys.exit(f'✗ {method} {path} → {e.code}: {e.read().decode(errors="replace")[:300]}')


def wait_for_server():
    """Il piano gratuito di Render dorme: si aspetta che risponda (fino a 3 minuti)."""
    print(f'… sveglio il server ({ROOT})', flush=True)
    for _ in range(36):
        try:
            with urllib.request.urlopen(ROOT + '/actuator/health', timeout=10) as r:
                if r.status == 200:
                    print('✓ server sveglio')
                    return
        except Exception:
            pass
        time.sleep(5)
    sys.exit('✗ il server non risponde: riprova tra poco')


def register(name, run):
    email = f'{name.lower()}.demo.{run}@splittrip.test'
    r = call('POST', '/auth/register', {'email': email, 'password': PASSWORD, 'displayName': name})
    return r['token'], email


def participants(trip_id, token):
    return {p['displayName']: p['id'] for p in call('GET', f'/trips/{trip_id}', token=token)['participants']}


def expense(trip_id, token, description, amount, date, category, payer, split, shares, day_basis=None):
    body = {'description': description, 'amount': amount, 'date': date.isoformat(), 'category': category,
            'payerId': payer, 'splitType': split, 'shares': shares}
    if day_basis:
        body['dayBasis'] = day_basis
    return call('POST', f'/trips/{trip_id}/expenses', body, token)


def message(trip_id, token, text):
    m = call('POST', f'/trips/{trip_id}/messages', {'content': text}, token)
    time.sleep(0.4)  # ordine dei messaggi e limite di 20 al minuto
    return m


def react(trip_id, token, message_id, emoji):
    call('POST', f'/trips/{trip_id}/messages/{message_id}/reactions/' + urllib.parse.quote(emoji), token=token)


def upload_photo(trip_id, token, path, caption, place, lat, lon):
    boundary = '----splittrip' + secrets.token_hex(8)
    fields = {'caption': caption, 'placeName': place, 'latitude': str(lat), 'longitude': str(lon)}
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items()]
    mime = mimetypes.guess_type(path.name)[0] or 'image/jpeg'
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
                 + path.read_bytes() + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    call('POST', f'/trips/{trip_id}/photos', raw=b''.join(parts), token=token, content_type=f'multipart/form-data; boundary={boundary}')


def main():
    parser = argparse.ArgumentParser(description='Dati di prova per la demo di SplitTrip')
    parser.add_argument('--foto', type=Path, help='cartella con fino a 4 foto .jpg da mettere su Lisbona')
    args = parser.parse_args()
    if len(PASSWORD) < 8 or not any(c.isalpha() for c in PASSWORD) or not any(c.isdigit() for c in PASSWORD):
        sys.exit('✗ imposta DEMO_PASSWORD (almeno 8 caratteri, con una lettera e una cifra)')

    wait_for_server()
    run = dt.datetime.now().strftime('%m%d%H%M')
    today = dt.date.today()
    day = lambda n: today + dt.timedelta(days=n)

    vale, vale_email = register('Vale', run)
    marco, marco_email = register('Marco', run)
    giulia, giulia_email = register('Giulia', run)
    print('✓ account demo creati')

    # ── Lisbona 2026: in corso ────────────────────────────────────────────────────────────────
    trip = call('POST', '/trips', {'name': 'Lisbona 2026', 'destination': 'Lisbona', 'startDate': day(-2).isoformat(),
                                   'endDate': day(3).isoformat(), 'latitude': 38.72509, 'longitude': -9.1498}, vale)
    tid, code = trip['id'], trip['inviteCode']
    call('POST', '/trips/join', {'code': code}, marco)
    call('POST', '/trips/join', {'code': code}, giulia)
    call('PATCH', f'/trips/{tid}', {'status': 'ONGOING'}, vale)
    P = participants(tid, vale)
    # Marco viaggia con la compagna (un solo telefono) e arriva un giorno dopo
    call('PATCH', f"/trips/{tid}/participants/{P['Marco']}", {'defaultWeight': 2, 'arrivalDate': day(-1).isoformat()}, marco)
    pina = call('POST', f'/trips/{tid}/participants', {'displayName': 'Nonna Pina'}, vale)
    call('PATCH', f"/trips/{tid}/participants/{pina['id']}", {'defaultWeight': 0.5}, vale)
    P = participants(tid, vale)

    m1 = message(tid, vale, 'Ciao a tutti! Casa ad Alfama prenotata, check-in alle 15')
    expense(tid, vale, 'Casa ad Alfama', 600, day(-2), 'LODGING', P['Vale'], 'DAYS',
            [{'participantId': P['Vale'], 'weight': 5}, {'participantId': P['Marco'], 'weight': 4},
             {'participantId': P['Giulia'], 'weight': 5}, {'participantId': P['Nonna Pina'], 'weight': 5}], day_basis='NIGHTS')
    m2 = message(tid, giulia, 'Io porto l\'ombrello, danno pioggia martedì')
    expense(tid, marco, 'Cena a Bairro Alto', 96, day(-1), 'FOOD', P['Marco'], 'WEIGHT',
            [{'participantId': P['Vale'], 'weight': 1}, {'participantId': P['Marco'], 'weight': 2},
             {'participantId': P['Giulia'], 'weight': 1}, {'participantId': P['Nonna Pina'], 'weight': 0.5}])
    m3 = message(tid, marco, 'Domani tram 28 di mattina presto?')
    expense(tid, giulia, 'Biglietti tram 28', 18, day(0), 'TRANSPORT', P['Giulia'], 'EQUAL',
            [{'participantId': P['Vale']}, {'participantId': P['Marco']}, {'participantId': P['Giulia']}])
    expense(tid, vale, 'Pastéis de Belém', 12.60, day(0), 'FOOD', P['Vale'], 'EQUAL',
            [{'participantId': P[n]} for n in ('Vale', 'Marco', 'Giulia', 'Nonna Pina')])
    m4 = message(tid, vale, 'Sì! Alle 8 alla fermata di Martim Moniz')
    for token, mid, emoji in [(marco, m4['id'], '👍'), (giulia, m4['id'], '👍'), (giulia, m4['id'], '🎉'),
                              (vale, m3['id'], '❤️'), (marco, m1['id'], '🎉'), (vale, m2['id'], '😂')]:
        react(tid, token, mid, emoji)
    call('POST', f'/trips/{tid}/settlements', {'fromParticipantId': P['Giulia'], 'toParticipantId': P['Vale'],
                                               'amount': 50, 'date': day(0).isoformat(), 'note': 'Bonifico per la casa'}, giulia)
    valigia = call('POST', f'/trips/{tid}/todo-lists', {'title': 'Valigia', 'type': 'PACKING'}, vale)
    for text, done in [('Ombrello', True), ('Scarpe comode', True), ('Adattatore', False), ('Crema solare', False)]:
        item = call('POST', f"/trips/{tid}/todo-lists/{valigia['id']}/items", {'text': text}, vale)
        if done:
            call('PATCH', f"/trips/{tid}/todo-lists/{valigia['id']}/items/{item['id']}", {'done': True}, vale)
    if args.foto:
        places = [('Alfama', 38.7112, -9.12772), ('Belém', 38.6979, -9.2065), ('Bairro Alto', 38.7135, -9.1446), ('Baixa', 38.7101, -9.1366)]
        photos = sorted(p for p in args.foto.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg'))[:4]
        for path, (place, lat, lon) in zip(photos, places):
            upload_photo(tid, vale, path, f'Vista da {place}', place, lat, lon)
        print(f'✓ {len(photos)} foto caricate')
    print('✓ Lisbona 2026 pronta')

    # ── Berlino: chiuso, da raccontare nel riepilogo finale ───────────────────────────────────
    ber = call('POST', '/trips', {'name': 'Berlino', 'destination': 'Berlino', 'startDate': '2026-05-01', 'endDate': '2026-05-05',
                                  'latitude': 52.52437, 'longitude': 13.41053}, vale)
    call('POST', '/trips/join', {'code': ber['inviteCode']}, marco)
    call('POST', '/trips/join', {'code': ber['inviteCode']}, giulia)
    B = participants(ber['id'], vale)
    everyone = [{'participantId': B[n]} for n in ('Vale', 'Marco', 'Giulia')]
    for who, desc, amount, d, cat in [('Vale', 'Appartamento a Kreuzberg', 420, '2026-05-01', 'LODGING'),
                                      ('Marco', 'Currywurst e birre', 54, '2026-05-01', 'FOOD'),
                                      ('Giulia', 'Museumsinsel, biglietti', 57, '2026-05-02', 'ACTIVITY'),
                                      ('Marco', 'Cena a Prenzlauer Berg', 88, '2026-05-03', 'FOOD'),
                                      ('Vale', 'Bici a noleggio', 45, '2026-05-04', 'TRANSPORT')]:
        token = {'Vale': vale, 'Marco': marco, 'Giulia': giulia}[who]
        expense(ber['id'], token, desc, amount, dt.date.fromisoformat(d), cat, B[who], 'EQUAL', everyone)
    call('PATCH', f"/trips/{ber['id']}", {'status': 'ONGOING'}, vale)
    call('PATCH', f"/trips/{ber['id']}", {'status': 'CLOSED'}, vale)
    print('✓ Berlino (chiuso) pronto')

    print('\nAccount per la demo (password: quella in DEMO_PASSWORD)')
    print(f'  PC       Vale    {vale_email}')
    print(f'  telefono Marco   {marco_email}')
    print(f'  riserva  Giulia  {giulia_email}')
    print(f'Codice invito di Lisbona: {code}')


if __name__ == '__main__':
    main()
