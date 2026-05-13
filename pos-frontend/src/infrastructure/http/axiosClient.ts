// ES: Cliente HTTP centralizado con interceptores
// EN: Centralized HTTP client with interceptors

import axios from 'axios'
import { ApiError } from './ApiError'
import { useSessionStore } from '../store/sessionStore'

export function resolveSalesApiBaseUrl(): string {
  const configured = import.meta.env.VITE_SALES_API_URL?.trim()
  const useMsw =
    String(import.meta.env.VITE_USE_MSW ?? 'true').toLowerCase() === 'true'

  if (import.meta.env.MODE === 'test') {
    return configured || 'http://localhost:8088'
  }

  if (import.meta.env.DEV && !useMsw) {
    return configured || ''
  }

  return configured || 'http://localhost:8088'
}

const axiosClient = axios.create({
  baseURL: resolveSalesApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ES: Interceptor de request: agrega X-Cashier-Id desde sessionStore
// EN: Request interceptor: adds X-Cashier-Id from sessionStore
axiosClient.interceptors.request.use((config) => {
  const cashierId = useSessionStore.getState().cashierId
  if (cashierId) {
    config.headers['X-Cashier-Id'] = cashierId
  }
  return config
})

// ES: Interceptor de response: mapea errores HTTP a ApiError tipado
// EN: Response interceptor: maps HTTP errors to typed ApiError
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      throw new ApiError(
        status,
        data?.message || `HTTP ${status}`,
        data?.outOfStockItems
      )
    }
    // ES: Error de red sin respuesta del servidor
    // EN: Network error without server response
    throw new ApiError(0, 'Network Error')
  }
)

export default axiosClient
