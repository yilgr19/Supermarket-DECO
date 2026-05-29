// ES: URL base API Gateway (lambda-ventas / LocalStack)
// EN: API Gateway base URL (lambda-ventas / LocalStack)

const lambdaBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''

/** Activo cuando VITE_API_BASE_URL apunta a LocalStack (lambda-ventas). */
export const isLambdaBackend = Boolean(lambdaBase)

export const API_BASE_URL = lambdaBase

export const endpoints = {
  productos: `${API_BASE_URL}/api/productos`,
  producto: (id: string) => `${API_BASE_URL}/api/productos/${encodeURIComponent(id)}`,
  ventas: `${API_BASE_URL}/api/v1/ventas`,
} as const

export const LAMBDA_UNAVAILABLE_MSG =
  'No disponible con backend Lambda (solo GET productos y POST ventas) / Not available with Lambda backend (products GET and sales POST only)'
