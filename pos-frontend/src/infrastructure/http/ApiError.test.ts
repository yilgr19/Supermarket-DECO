// ES: Pruebas del mapeo de errores de API
// EN: API error mapping tests

import { describe, it, expect } from 'vitest'
import { ApiError, getErrorMessage } from './ApiError'

describe('ApiError', () => {
  it('should store status and message', () => {
    const err = new ApiError(422, 'Credit not approved')
    expect(err.status).toBe(422)
    expect(err.message).toBe('Credit not approved')
    expect(err.name).toBe('ApiError')
  })

  it('should store outOfStockItems for 409', () => {
    const items = [{ productId: 'p1', productName: 'Leche', requested: 5, available: 2 }]
    const err = new ApiError(409, 'Insufficient stock', items)
    expect(err.outOfStockItems).toEqual(items)
  })
})

describe('getErrorMessage', () => {
  it('returns 503 message for service unavailable', () => {
    const err = new ApiError(503, 'Service down')
    expect(getErrorMessage(err)).toContain('Servicio no disponible')
  })

  it('returns 404 message for not found', () => {
    const err = new ApiError(404, 'Not found')
    expect(getErrorMessage(err)).toContain('No encontrado')
  })

  it('returns stock-focused message for 409 when backend omits message', () => {
    const err = new ApiError(409, '')
    expect(getErrorMessage(err)).toContain('Sin stock suficiente')
  })

  it('returns original message for 422', () => {
    const err = new ApiError(422, 'El crédito no está aprobado')
    expect(getErrorMessage(err)).toBe('El crédito no está aprobado')
  })

  it('returns network error message for network failures', () => {
    const err = new Error('Network Error')
    expect(getErrorMessage(err)).toContain('Sin conexión')
  })

  it('returns unknown error for non-Error objects', () => {
    expect(getErrorMessage('string error')).toContain('desconocido')
  })
})
