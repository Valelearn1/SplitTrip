import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { installStore } from './features/pwa/installPrompt'
import { watchBrowserNetwork } from './features/pwa/networkState'
import 'leaflet/dist/leaflet.css'
import './index.css'

watchBrowserNetwork()   // prima di tutto: se il telefono è già senza rete, l'app parte offline (D-63)
installStore.listen(window)   // l'evento di installazione arriva presto: lo si cattura prima di disegnare l'app

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
