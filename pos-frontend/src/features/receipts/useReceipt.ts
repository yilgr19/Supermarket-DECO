// ES: Hook para obtener recibos por TransactionId
// EN: Hook to fetch receipts by TransactionId

import { useState, useEffect } from 'react'
import axiosClient from '../../infrastructure/http/axiosClient'
import type { Receipt } from '../../core/types/receipt.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

export function useReceipt(transactionId: string | undefined) {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!transactionId) return
    setIsLoading(true)
    setError(null)
    axiosClient
      .get<Receipt>(`/api/v1/receipts/${transactionId}`)
      .then((res) => setReceipt(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [transactionId])

  return { receipt, isLoading, error }
}
