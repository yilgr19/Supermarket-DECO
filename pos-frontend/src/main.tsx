import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { invalidateLambdaCatalog } from './adapters/http/lambdaCatalogCache'

/** ES: En desarrollo, MSW simula la API si VITE_USE_MSW no es 'false'.
 *  EN: In dev, MSW mocks the API unless VITE_USE_MSW === 'false'. */
async function enableMocks(): Promise<void> {
  const lambdaUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const useMsw =
    import.meta.env.DEV &&
    !lambdaUrl &&
    String(import.meta.env.VITE_USE_MSW ?? 'true').toLowerCase() !== 'false'
  if (!useMsw) return
  const { worker } = await import('./mocks/browser')
  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: 'bypass',
  })
}

enableMocks().then(() => {
  if (import.meta.env.VITE_API_BASE_URL?.trim()) {
    invalidateLambdaCatalog()
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
