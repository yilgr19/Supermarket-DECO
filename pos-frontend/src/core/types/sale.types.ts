// ES: Tipos del dominio de ventas / EN: Sale domain types

export type SaleStatus =
  | 'ACTIVE'
  | 'FROZEN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PARTIALLY_RETURNED'

export type PaymentType = 'CASH' | 'CREDIT'

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface SaleItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  discount?: number
  discountType?: DiscountType
  discountValue?: number
}

export interface Sale {
  id: string
  terminalId: string
  cashierId: string
  customerId?: string
  status: SaleStatus
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  discountType?: DiscountType
  discountValue?: number
  frozenAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export interface ReturnItemRequest {
  saleItemId: string
  quantity: number
  reason: string
}

export interface OutOfStockItem {
  productId: string
  productName: string
  requested: number
  available: number
}
