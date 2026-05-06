// ES: Error tipado para respuestas de la API
// EN: Typed error for API responses

import type { OutOfStockItem } from '../../core/types/sale.types'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly outOfStockItems?: OutOfStockItem[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ES: Mapea código HTTP a mensaje operativo para el cajero
// EN: Maps HTTP code to operational message for the cashier
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return 'Sin conexión, verifique su red / No connection, check your network'
      case 503:
        return 'Servicio no disponible, intente de nuevo / Service unavailable, please try again'
      case 404:
        return 'No encontrado / Not found'
      case 409:
        return (
          error.message?.trim() ||
          'Sin stock suficiente en una o más líneas / Insufficient stock on one or more lines'
        )
      case 422:
        return (
          error.message?.trim() || 'Operación no permitida por el servidor / Operation not allowed'
        )
      case 400:
        return error.message?.trim() || 'Datos inválidos / Invalid data'
      default:
        return error.message?.trim() || 'Error desconocido / Unknown error'
    }
  }
  if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('network')) {
      return 'Sin conexión, verifique su red / No connection, check your network'
    }
    return error.message
  }
  return 'Error desconocido / Unknown error'
}
