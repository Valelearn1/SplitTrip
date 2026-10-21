import { expect, test, type Browser } from '@playwright/test'

// D-66: due persone vere, ognuna nel suo browser; email nuove a ogni giro
const stamp = Date.now()
const password = `Giro${stamp}x1`   // almeno 8 caratteri, una lettera e una cifra
const iso = (d: Date) => d.toISOString().slice(0, 10)
const lisbona = { name: 'Lisbona', detail: 'Portogallo', latitude: 38.7169, longitude: -9.1399 }

async function person(browser: Browser, name: string) {
  const page = await (await browser.newContext()).newPage()
  // solo nel test: in produzione i luoghi arrivano dal backend (D-46, D-51)
  await page.route('**/api/places**', (route) => route.fulfill({ json: [lisbona] }))
  // solo nel test: il cambio BCE arriva dal backend (D-69), qui è fisso per non dipendere da Frankfurter
  await page.route('**/api/rates**', (route) => route.fulfill({ json: { rate: 0.00562366, date: '2026-10-16' } }))
  await page.goto('/register')
  await page.getByLabel('Nome', { exact: true }).fill(name)
  await page.getByLabel('Email', { exact: true }).fill(`e2e-${stamp}-${name.toLowerCase()}@splittrip.test`)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Registrati' }).click()
  await expect(page).toHaveURL(/\/trips$/)
  return page
}

test('giro completo: viaggio, invito col QR, spesa, saldo e «Salda»', async ({ browser }) => {
  const ada = await person(browser, 'Ada')
  await ada.goto('/trips/new')
  await ada.getByLabel('Nome del viaggio').fill('Lisbona E2E')
  await ada.getByRole('combobox', { name: 'Destinazione' }).fill('Lis')
  await ada.getByRole('option', { name: /Lisbona/ }).click()
  await ada.getByLabel('Partenza').fill(iso(new Date()))
  await ada.getByLabel('Ritorno').fill(iso(new Date(Date.now() + 3 * 86_400_000)))
  await ada.getByRole('button', { name: 'Crea viaggio' }).click()
  await expect(ada).toHaveURL(/\/trips\/[0-9a-f-]+\/benvenuto$/)
  const trip = new URL(ada.url()).pathname.replace(/\/benvenuto$/, '')

  // l'invito col QR: il codice si legge dal nome dell'immagine
  await ada.goto(trip)
  await ada.getByRole('button', { name: 'QR' }).click()
  const dialog = ada.getByRole('dialog', { name: 'Entra nel viaggio' })
  const qr = dialog.getByRole('img', { name: /^QR per entrare nel viaggio Lisbona E2E, codice / })
  await expect(qr).toBeVisible()
  const code = (await qr.getAttribute('aria-label'))!.replace(/^.*codice /, '')
  await dialog.getByRole('button', { name: 'Chiudi' }).click()

  const bruno = await person(browser, 'Bruno')
  await bruno.goto(`/join/${code}`)
  await bruno.getByRole('button', { name: 'Entra' }).click()
  await expect(bruno.getByRole('heading', { name: 'Ti diamo il benvenuto in Lisbona E2E' })).toBeVisible()

  // Ada paga la cena per tutti e due: pagata da lei e divisa in parti uguali sono i valori iniziali del modulo
  await ada.goto(`${trip}/expenses/new`)
  await ada.getByLabel('Importo').fill('60')
  await ada.getByLabel('Descrizione').fill('Cena')
  await ada.getByRole('button', { name: /^Salva/ }).click()
  await expect(ada).toHaveURL(new RegExp(`${trip}/expenses$`))

  // il saldo si legge aprendo la pagina (il tempo reale ha i suoi test)
  await bruno.goto(`${trip}/balances`)
  await expect(bruno.getByText('Devi dare').first()).toBeVisible()
  await expect(bruno.getByText('30,00 €').first()).toBeVisible()
  await bruno.getByRole('link', { name: 'Salda' }).click()
  await expect(bruno.getByLabel('Importo')).toHaveValue(/^30,00$/)
  await bruno.getByRole('button', { name: 'Conferma' }).click()
  await expect(bruno.getByText('Siete in pari')).toBeVisible()

  await ada.goto(`${trip}/balances`)
  await expect(ada.getByText('Siete in pari')).toBeVisible()

  // Bruno paga il sushi in yen: la spesa si salva come 3.000 JPY e i saldi si muovono di 16,87 € convertiti (D-69)
  await bruno.goto(`${trip}/expenses/new`)
  await bruno.getByLabel('Valuta').selectOption('JPY')
  await expect(bruno.getByText('Cambio del 16 ott (BCE): 1 € = 177,82 JPY')).toBeVisible()
  await bruno.getByLabel('Importo').fill('3000')
  await bruno.getByLabel('Descrizione').fill('Sushi')
  await expect(bruno.getByText('≈ 16,87 €').first()).toBeVisible()   // sotto l'importo (e nell'eco di «Salva»)
  await bruno.getByRole('button', { name: /^Salva/ }).click()
  await expect(bruno).toHaveURL(new RegExp(`${trip}/expenses$`))
  await expect(bruno.getByText(/3\.000\sJPY/)).toBeVisible()
  await expect(bruno.getByText(/≈ 16,87\s€/)).toBeVisible()

  await ada.goto(`${trip}/balances`)
  await expect(ada.getByText('Devi dare').first()).toBeVisible()
  await expect(ada.getByText(/8,4[34]\s€/).first()).toBeVisible()
})
