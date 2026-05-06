// ES: Hook para procesamiento de devoluciones
// EN: Hook for return processing

import { useState } from 'react'
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter'
import { makeReturnUseCases } from '../../core/usecases/return.usecases'
import { useApiError } from '../../shared/hooks/useApiError'
import type { ReturnItemRequest } from '../../core/types/sale.types'
import type { Receipt } from '../../core/types/receipt.types'

const returnUc = makeReturnUseCases(salesApiAdapter)

export function useReturn() {
  const [isLoading, setIsLoading] = useState(false)
  const { error, handleError, clearError } = useApiError()

  const fullReturn = async (saleId: string, reason: string): Promise<Receipt | null> => {
    setIsLoading(true)
    clearError()
    try {
      const receipt = await returnUc.fullReturn(saleId, reason)
      return receipt
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const partialReturn = async (
    saleId: string,
    items: ReturnItemRequest[]
  ): Promise<Receipt | null> => {
    setIsLoading(true)
    clearError()
    try {
      const receipt = await returnUc.partialReturn(saleId, items)
      return receipt
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, clearError, fullReturn, partialReturn }
}
