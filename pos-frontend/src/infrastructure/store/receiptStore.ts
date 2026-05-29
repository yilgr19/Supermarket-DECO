// ES: Recibos en memoria tras checkout Lambda (sin GET /api/v1/receipts)
// EN: In-memory receipts after Lambda checkout (no GET /api/v1/receipts)

import { create } from 'zustand'
import type { Receipt } from '../../core/types/receipt.types'

interface ReceiptState {
  byTransactionId: Record<string, Receipt>
  save: (receipt: Receipt) => void
  get: (transactionId: string) => Receipt | undefined
  clear: () => void
}

export const useReceiptStore = create<ReceiptState>()((set, get) => ({
  byTransactionId: {},
  save: (receipt) =>
    set((state) => ({
      byTransactionId: {
        ...state.byTransactionId,
        [receipt.transactionId]: receipt,
      },
    })),
  get: (transactionId) => get().byTransactionId[transactionId],
  clear: () => set({ byTransactionId: {} }),
}))
