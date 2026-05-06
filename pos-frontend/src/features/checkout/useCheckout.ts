// ES: Hook de checkout (pago en efectivo y crédito)
// EN: Checkout hook (cash and credit payment)

import { useState } from 'react'
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter'
import { makeCheckoutUseCases } from '../../core/usecases/checkout.usecases'
import { useSaleStore } from '../../infrastructure/store/saleStore'
import { useApiError } from '../../shared/hooks/useApiError'
import type { Receipt } from '../../core/types/receipt.types'

const checkoutUc = makeCheckoutUseCases(salesApiAdapter)

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const { activeSale, clearSale } = useSaleStore()
  const { error, handleError, clearError } = useApiError()

  const checkoutCash = async (amountReceived: number): Promise<Receipt | null> => {
    if (!activeSale) return null

    setIsLoading(true)
    clearError()
    try {
      const receipt = await checkoutUc.checkoutCash(
        activeSale.id,
        activeSale.total,
        amountReceived
      )
      clearSale()
      return receipt
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const checkoutCredit = async (): Promise<Receipt | null> => {
    if (!activeSale) return null

    const selectedCustomer = useSaleStore.getState().selectedCustomer
    if (!selectedCustomer) {
      handleError(
        new Error(
          'Se requiere un cliente para pago a crédito / Customer required for credit payment'
        )
      )
      return null
    }
    if (selectedCustomer.creditStatus !== 'APPROVED') {
      handleError(
        new Error(
          `Crédito no aprobado (${selectedCustomer.creditStatus}) — REJECTED y PENDING no permitidos / Credit not approved`
        )
      )
      return null
    }

    setIsLoading(true)
    clearError()
    try {
      const receipt = await checkoutUc.checkoutCredit(activeSale.id)
      clearSale()
      return receipt
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    activeSale,
    isLoading,
    error,
    clearError,
    checkoutCash,
    checkoutCredit,
  }
}
