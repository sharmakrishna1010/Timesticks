import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Remove the HTML splash screen the moment React takes over.
// It was shown while the JS bundle was loading (before this line runs).
const splash = document.getElementById('ts-splash');
if (splash) splash.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
