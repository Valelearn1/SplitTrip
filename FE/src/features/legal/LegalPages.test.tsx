import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { expectAccessible } from '../../test/a11y'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PrivacyPage } from './PrivacyPage'
import { TermsPage } from './TermsPage'

// D-72: due pagine pubbliche, leggibili senza account (nessun token nello storage in questi test)
const routes = [{ path: '/termini', element: <TermsPage /> }, { path: '/privacy', element: <PrivacyPage /> }]

it('i termini si leggono senza account e dicono le cose che contano', async () => {
  renderWithProviders(routes, '/termini')
  expect(await screen.findByRole('heading', { level: 1, name: 'Termini e condizioni' })).toBeInTheDocument()
  expect(screen.getByText('Ultimo aggiornamento: 24 ottobre 2026')).toBeInTheDocument()
  for (const h of ['Il servizio', 'Account', 'I tuoi contenuti', 'Uso corretto', 'Conti e consigli', 'Responsabilità', 'Modifiche e legge applicabile']) {
    expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
  }
  expect(screen.getByText(/progetto didattico/)).toBeInTheDocument()
  expect(screen.getByText(/non sposta denaro/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Informativa sulla privacy' })).toHaveAttribute('href', '/privacy')
  await expectAccessible()
})

it('l’informativa nomina titolare, contatto di esempio, fornitori, diritti e memoria del dispositivo', async () => {
  renderWithProviders(routes, '/privacy')
  expect(await screen.findByRole('heading', { level: 1, name: 'Informativa sulla privacy' })).toBeInTheDocument()
  for (const h of ['Chi tratta i dati', 'Quali dati', 'Perché e su quale base', 'A chi arrivano', 'Fuori dall’Unione europea', 'Per quanto tempo', 'I tuoi diritti', 'Cookie e memoria del dispositivo', 'Minori']) {
    expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
  }
  expect(screen.getAllByText(/Valentina Ferro/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/privacy@splittrip\.example/).length).toBeGreaterThan(0)
  expect(screen.getByText(/indirizzo di esempio/)).toBeInTheDocument()   // finché non c'è un contatto vero, lo diciamo
  for (const who of ['Render', 'Brevo', 'Anthropic', 'Open-Meteo', 'Frankfurter', 'OpenStreetMap', 'Google Fonts']) {
    expect(screen.getAllByText(new RegExp(who)).length).toBeGreaterThan(0)
  }
  expect(screen.getByText(/non usa cookie/)).toBeInTheDocument()
  expect(screen.getByText(/data e ora in cui hai accettato i Termini/)).toBeInTheDocument()   // D-73
  expect(screen.getByRole('region', { name: /Fornitori/ })).toHaveAttribute('tabindex', '0')   // la tabella scorre di lato: raggiungibile da tastiera
  expect(screen.getByRole('link', { name: /Garante/ })).toHaveAttribute('href', 'https://www.garanteprivacy.it')
  await expectAccessible()
})
