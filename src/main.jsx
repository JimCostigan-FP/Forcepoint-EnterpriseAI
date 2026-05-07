import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './portal.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')

// Sync sidebar state from localStorage / viewport BEFORE first paint to avoid flicker.
try {
  const isMobile = window.matchMedia('(max-width: 720px)').matches
  const stored = localStorage.getItem('fp-sidebar')
  const open = isMobile ? false : stored !== 'collapsed'
  rootEl.dataset.sidebarOpen = open ? 'true' : 'false'
} catch {
  rootEl.dataset.sidebarOpen = 'true'
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
