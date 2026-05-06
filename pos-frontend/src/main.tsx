import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/** ES: En desarrollo, MSW simula la API si VITE_USE_MSW no es 'false'.
 *  EN: In dev, MSW mocks the API unless VITE_USE_MSW === 'false'. */
async function enableMocks(): Promise<void> {
  const useMsw =
    import.meta.env.DEV && String(import.meta.env.VITE_USE_MSW ?? 'true').toLowerCase() !== 'false'
  if (!useMsw) return
  const { worker } = await import('./mocks/browser')
  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: 'bypass',
  })
}

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
