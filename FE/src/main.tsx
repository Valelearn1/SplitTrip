import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { watchBrowserNetwork } from './features/pwa/networkState'
import 'leaflet/dist/leaflet.css'
import './index.css'

watchBrowserNetwork()   // prima di tutto: se il telefono è già senza rete, l'app parte offline (D-63)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
