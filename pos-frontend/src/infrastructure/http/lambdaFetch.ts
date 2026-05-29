// ES: Cliente fetch para API Gateway lambda-ventas
// EN: fetch client for lambda-ventas API Gateway

import { ApiError } from './ApiError'
import type { ApiErrorLambda } from '../../core/types/lambda.types'

export async function lambdaFetch<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = init?.timeoutMs ?? 120_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let data: unknown
  try {
    const { timeoutMs: _t, ...fetchInit } = init ?? {}
    const res = await fetch(url, {
      ...fetchInit,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchInit.headers,
      },
    })
    const text = await res.text()
    data = text ? JSON.parse(text) : {}
    if (!res.ok) {
      const errBody = data as ApiErrorLambda
      throw new ApiError(res.status, errBody.error ?? res.statusText)
    }
    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        0,
        'Tiempo de espera agotado. Verifique LocalStack e intente de nuevo / Request timed out'
      )
    }
    if (err instanceof SyntaxError) {
      throw new ApiError(0, 'Respuesta inválida del servidor / Invalid server response')
    }
    throw new ApiError(0, 'Sin conexión con el backend Lambda / No connection to Lambda backend')
  } finally {
    clearTimeout(timer)
  }
}
