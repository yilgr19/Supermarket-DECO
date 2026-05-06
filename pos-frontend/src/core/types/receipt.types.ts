// ES: Tipos para recibos de venta y devolución
// EN: Types for sale and return receipts

import type { PaymentType } from './sale.types';

export interface ReceiptItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Receipt {
  transactionId: string;
  saleId: string;
  receiptType: 'SALE' | 'FULL_RETURN' | 'PARTIAL_RETURN';
  storeName: string;
  terminalId: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  paymentType: PaymentType;
  amountReceived?: number;
  changeAmount?: number;
  creditReference?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  originalTransactionId?: string;
  createdAt: string;
}
