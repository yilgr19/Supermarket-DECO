// ES: Hook para manejo centralizado de errores de API
// EN: Hook for centralized API error handling

import { useState } from 'react'
import { ApiError, getErrorMessage } from '../../infrastructure/http/ApiError'
import type { OutOfStockItem } from '../../core/types/sale.types'

interface ApiErrorState {
  message: string | null
  outOfStockItems: OutOfStockItem[] | null
  status: number | null
}

export function useApiError() {
  const [error, setError] = useState<ApiErrorState>({
    message: null,
    outOfStockItems: null,
    status: null,
  })

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError({
        message: getErrorMessage(err),
        outOfStockItems: err.outOfStockItems ?? null,
        status: err.status,
      })
    } else {
      setError({
        message: getErrorMessage(err),
        outOfStockItems: null,
        status: null,
      })
    }
  }

  const clearError = () => setError({ message: null, outOfStockItems: null, status: null })

  return { error, handleError, clearError }
}
