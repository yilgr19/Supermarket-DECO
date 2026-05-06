// ES: Puerto de ventas — interfaz de contrato para operaciones de venta
// EN: Sale port — contract interface for sale operations

import type { Sale, DiscountType, PaymentType, ReturnItemRequest } from '../types/sale.types';
import type { Receipt } from '../types/receipt.types';

export interface SalePort {
  createSale(terminalId: string, customerId?: string): Promise<Sale>;
  getSale(saleId: string): Promise<Sale>;
  addItem(saleId: string, productId?: string, barcode?: string, quantity?: number): Promise<Sale>;
  updateItem(saleId: string, itemId: string, quantity: number): Promise<Sale>;
  removeItem(saleId: string, itemId: string): Promise<Sale>;
  applyDiscount(saleId: string, type: DiscountType, value: number): Promise<Sale>;
  freeze(saleId: string): Promise<Sale>;
  resume(saleId: string): Promise<Sale>;
  cancel(saleId: string, reason: string): Promise<Sale>;
  listFrozen(terminalId: string): Promise<Sale[]>;
  checkout(saleId: string, paymentType: PaymentType, amountReceived?: number): Promise<Receipt>;
  fullReturn(saleId: string, reason: string): Promise<Receipt>;
  partialReturn(saleId: string, items: ReturnItemRequest[]): Promise<Receipt>;
}
