// ES: Tipos del dominio de recibos / EN: Receipt domain types

import type { PaymentType } from './sale.types'

export type ReceiptType = 'SALE' | 'FULL_RETURN' | 'PARTIAL_RETURN'

export interface ReceiptItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  returnReason?: string
}

export interface Receipt {
  id: string
  transactionId: string
  saleId: string
  receiptType: ReceiptType
  storeName: string
  terminalId: string
  cashierId: string
  customerId?: string
  customerName?: string
  paymentType: PaymentType
  amountReceived?: number
  changeAmount?: number
  creditReference?: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  originalTransactionId?: string
  createdAt: string
}
