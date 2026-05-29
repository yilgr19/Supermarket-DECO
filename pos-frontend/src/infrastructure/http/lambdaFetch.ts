// ES: Cliente fetch para API Gateway lambda-ventas
// EN: fetch client for lambda-ventas API Gateway

import { ApiError } from './ApiError'
import type { ApiErrorLambda } from '../../core/types/lambda.types'

export async function lambdaFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let data: unknown
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
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
    if (err instanceof SyntaxError) {
      throw new ApiError(0, 'Respuesta inválida del servidor / Invalid server response')
    }
    throw new ApiError(0, 'Sin conexión con el backend Lambda / No connection to Lambda backend')
  }
}
