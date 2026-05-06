// ES: Adaptador HTTP para la Sales API — implementa SalePort
// EN: HTTP adapter for the Sales API — implements SalePort

import axiosInstance from '../../infrastructure/http/axiosClient';
import type { SalePort } from '../../core/ports/SalePort';
import type { Sale, DiscountType, PaymentType, ReturnItemRequest } from '../../core/types/sale.types';
import type { Receipt } from '../../core/types/receipt.types';

export const salesApiAdapter: SalePort = {
  // ES: Crea una nueva venta en el terminal
  // EN: Creates a new sale at the terminal
  async createSale(terminalId: string, customerId?: string): Promise<Sale> {
    const response = await axiosInstance.post<Sale>('/api/v1/sales', {
      terminalId,
      customerId,
    });
    return response.data;
  },

  // ES: Obtiene una venta por ID
  // EN: Gets a sale by ID
  async getSale(saleId: string): Promise<Sale> {
    const response = await axiosInstance.get<Sale>(`/api/v1/sales/${saleId}`);
    return response.data;
  },

  // ES: Agrega un ítem a la venta por productId o barcode
  // EN: Adds an item to the sale by productId or barcode
  async addItem(saleId: string, productId?: string, barcode?: string, quantity: number = 1): Promise<Sale> {
    const response = await axiosInstance.post<Sale>(`/api/v1/sales/${saleId}/items`, {
      productId,
      barcode,
      quantity,
    });
    return response.data;
  },

  // ES: Actualiza la cantidad de un ítem en la venta
  // EN: Updates the quantity of an item in the sale
  async updateItem(saleId: string, itemId: string, quantity: number): Promise<Sale> {
    const response = await axiosInstance.put<Sale>(`/api/v1/sales/${saleId}/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  // ES: Elimina un ítem de la venta
  // EN: Removes an item from the sale
  async removeItem(saleId: string, itemId: string): Promise<Sale> {
    const response = await axiosInstance.delete<Sale>(`/api/v1/sales/${saleId}/items/${itemId}`);
    return response.data;
  },

  // ES: Aplica un descuento a la venta
  // EN: Applies a discount to the sale
  async applyDiscount(saleId: string, type: DiscountType, value: number): Promise<Sale> {
    const response = await axiosInstance.post<Sale>(`/api/v1/sales/${saleId}/discount`, {
      type,
      value,
    });
    return response.data;
  },

  // ES: Congela la venta (ACTIVE → FROZEN)
  // EN: Freezes the sale (ACTIVE → FROZEN)
  async freeze(saleId: string): Promise<Sale> {
    const response = await axiosInstance.post<Sale>(`/api/v1/sales/${saleId}/freeze`);
    return response.data;
  },

  // ES: Reanuda una venta congelada (FROZEN → ACTIVE)
  // EN: Resumes a frozen sale (FROZEN → ACTIVE)
  async resume(saleId: string): Promise<Sale> {
    const response = await axiosInstance.post<Sale>(`/api/v1/sales/${saleId}/resume`);
    return response.data;
  },

  // ES: Cancela la venta con un motivo
  // EN: Cancels the sale with a reason
  async cancel(saleId: string, reason: string): Promise<Sale> {
    const response = await axiosInstance.post<Sale>(`/api/v1/sales/${saleId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // ES: Lista las ventas congeladas del terminal
  // EN: Lists frozen sales for the terminal
  async listFrozen(terminalId: string): Promise<Sale[]> {
    const response = await axiosInstance.get<Sale[]>('/api/v1/sales/frozen', {
      params: { terminalId },
    });
    return response.data;
  },

  // ES: Realiza el checkout de la venta
  // EN: Performs the sale checkout
  async checkout(saleId: string, paymentType: PaymentType, amountReceived?: number): Promise<Receipt> {
    const response = await axiosInstance.post<Receipt>(`/api/v1/sales/${saleId}/checkout`, {
      paymentType,
      amountReceived,
    });
    return response.data;
  },

  // ES: Procesa una devolución total de la venta
  // EN: Processes a full return of the sale
  async fullReturn(saleId: string, reason: string): Promise<Receipt> {
    const response = await axiosInstance.post<Receipt>(`/api/v1/sales/${saleId}/return`, {
      reason,
    });
    return response.data;
  },

  // ES: Procesa una devolución parcial de la venta
  // EN: Processes a partial return of the sale
  async partialReturn(saleId: string, items: ReturnItemRequest[]): Promise<Receipt> {
    const response = await axiosInstance.post<Receipt>(`/api/v1/sales/${saleId}/partial-return`, {
      items,
    });
    return response.data;
  },
};
