// ES: Hook principal de gestión de la venta activa
// EN: Main hook for active sale management

import { useState, useCallback } from 'react'
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter'
import { makeSaleUseCases } from '../../core/usecases/sale.usecases'
import { useSaleStore } from '../../infrastructure/store/saleStore'
import { useSessionStore } from '../../infrastructure/store/sessionStore'
import { useApiError } from '../../shared/hooks/useApiError'
import type { DiscountType } from '../../core/types/sale.types'

const saleUc = makeSaleUseCases(salesApiAdapter)

export function useSale() {
  const [isLoading, setIsLoading] = useState(false)
  const { activeSale, setActiveSale, clearSale } = useSaleStore()
  const { terminalId } = useSessionStore()
  const { error, handleError, clearError } = useApiError()

  const createSale = useCallback(async (customerId?: string) => {
    if (!terminalId) return
    setIsLoading(true)
    clearError()
    try {
      const sale = await saleUc.createSale(terminalId, customerId)
      setActiveSale(sale)
      return sale
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [terminalId, setActiveSale, handleError, clearError])

  const addItemToSale = useCallback(
    async (productId?: string, barcode?: string, quantity = 1) => {
      if (!activeSale) return
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.addItemToSale(
          activeSale.id,
          productId,
          barcode,
          quantity
        )
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSale, setActiveSale, handleError, clearError]
  )

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!activeSale) return
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.updateItemQuantity(
          activeSale.id,
          itemId,
          quantity
        )
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSale, setActiveSale, handleError, clearError]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!activeSale) return
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.removeItem(activeSale.id, itemId)
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSale, setActiveSale, handleError, clearError]
  )

  const applyDiscount = useCallback(
    async (type: DiscountType, value: number) => {
      if (!activeSale) return
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.applyDiscount(activeSale.id, type, value)
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSale, setActiveSale, handleError, clearError]
  )

  const freezeSale = useCallback(async () => {
    if (!activeSale) return
    setIsLoading(true)
    clearError()
    try {
      const updated = await saleUc.freezeSale(activeSale.id)
      setActiveSale(updated)
      return updated
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [activeSale, setActiveSale, handleError, clearError])

  const resumeSale = useCallback(
    async (saleId: string) => {
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.resumeSale(saleId)
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [setActiveSale, handleError, clearError]
  )

  const cancelSale = useCallback(
    async (reason: string) => {
      if (!activeSale) return
      setIsLoading(true)
      clearError()
      try {
        const updated = await saleUc.cancelSale(activeSale.id, reason)
        setActiveSale(updated)
        return updated
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSale, setActiveSale, handleError, clearError]
  )

  const startNewSale = useCallback(() => {
    clearSale()
  }, [clearSale])

  return {
    activeSale,
    isLoading,
    error,
    clearError,
    createSale,
    addItemToSale,
    updateItemQuantity,
    removeItem,
    applyDiscount,
    freezeSale,
    resumeSale,
    cancelSale,
    startNewSale,
  }
}
