import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'
import ServiceIncidentAlert from './components/communication/ServiceIncidentAlert.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="terminal-global-effects" aria-hidden="true" />
    <ServiceIncidentAlert />
    <div className="app-content">
      <App />
    </div>
  </StrictMode>,
)
