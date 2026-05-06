// ES: Tipos principales para la gestión de ventas
// EN: Main types for sale management

export type SaleStatus =
  | 'ACTIVE'
  | 'FROZEN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PARTIALLY_RETURNED';

export type PaymentType = 'CASH' | 'CREDIT';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  terminalId: string;
  cashierId: string;
  customerId?: string;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  frozenAt?: string;
}

export interface ReturnItemRequest {
  saleItemId: string;
  quantity: number;
  reason: string;
}
