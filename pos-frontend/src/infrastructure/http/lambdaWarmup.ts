// ES: Precalienta la Lambda ventas-post (evita cold start ~15s en el checkout)
// EN: Pre-warm ventas-post Lambda (avoids ~15s cold start at checkout)

import { endpoints } from '../../config/api'

let ventasWarmPromise: Promise<void> | null = null

/** Dispara un POST inválido para cargar la JVM de ventas-post en segundo plano. */
export function warmUpVentasLambda(): void {
  if (ventasWarmPromise) return
  ventasWarmPromise = fetch(endpoints.ventas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [] }),
  })
    .then(() => undefined)
    .catch(() => undefined)
}

export function warmUpVentasLambdaAsync(): Promise<void> {
  warmUpVentasLambda()
  return ventasWarmPromise ?? Promise.resolve()
}
