// ES: Adaptador HTTP para la Sales API
// EN: HTTP adapter for the Sales API

import axiosClient from '../../infrastructure/http/axiosClient'
import type { SalePort } from '../../core/ports/SalePort'
import type { Sale, ReturnItemRequest, PaymentType, DiscountType } from '../../core/types/sale.types'
import type { Receipt } from '../../core/types/receipt.types'

export const salesApiAdapter: SalePort = {
  async createSale(terminalId: string, customerId?: string): Promise<Sale> {
    const response = await axiosClient.post<Sale>('/api/v1/sales', {
      terminalId,
      ...(customerId && { customerId }),
    })
    return response.data
  },

  async getSale(saleId: string): Promise<Sale> {
    const response = await axiosClient.get<Sale>(`/api/v1/sales/${saleId}`)
    return response.data
  },

  async addItem(
    saleId: string,
    productId: string | undefined,
    barcode: string | undefined,
    quantity: number
  ): Promise<Sale> {
    const response = await axiosClient.post<Sale>(`/api/v1/sales/${saleId}/items`, {
      ...(productId && { productId }),
      ...(barcode && { barcode }),
      quantity,
    })
    return response.data
  },

  async updateItem(saleId: string, itemId: string, quantity: number): Promise<Sale> {
    const response = await axiosClient.put<Sale>(
      `/api/v1/sales/${saleId}/items/${itemId}`,
      { quantity }
    )
    return response.data
  },

  async removeItem(saleId: string, itemId: string): Promise<Sale> {
    const response = await axiosClient.delete<Sale>(
      `/api/v1/sales/${saleId}/items/${itemId}`
    )
    return response.data
  },

  async applyDiscount(saleId: string, type: DiscountType, value: number): Promise<Sale> {
    const response = await axiosClient.post<Sale>(`/api/v1/sales/${saleId}/discount`, {
      discountType: type,
      discountValue: value,
    })
    return response.data
  },

  async freeze(saleId: string): Promise<Sale> {
    const response = await axiosClient.post<Sale>(`/api/v1/sales/${saleId}/freeze`)
    return response.data
  },

  async resume(saleId: string): Promise<Sale> {
    const response = await axiosClient.post<Sale>(`/api/v1/sales/${saleId}/resume`)
    return response.data
  },

  async cancel(saleId: string, reason: string): Promise<Sale> {
    const response = await axiosClient.post<Sale>(`/api/v1/sales/${saleId}/cancel`, {
      reason,
    })
    return response.data
  },

  async listFrozen(terminalId: string): Promise<Sale[]> {
    const response = await axiosClient.get<Sale[]>('/api/v1/sales/frozen', {
      params: { terminalId },
    })
    return response.data
  },

  async checkout(
    saleId: string,
    paymentType: PaymentType,
    amountReceived?: number
  ): Promise<Receipt> {
    const response = await axiosClient.post<Receipt>(`/api/v1/sales/${saleId}/checkout`, {
      paymentType,
      ...(amountReceived !== undefined && { amountReceived }),
    })
    return response.data
  },

  async fullReturn(saleId: string, reason: string): Promise<Receipt> {
    const response = await axiosClient.post<Receipt>(`/api/v1/sales/${saleId}/return`, {
      reason,
    })
    return response.data
  },

  async partialReturn(saleId: string, items: ReturnItemRequest[]): Promise<Receipt> {
    const response = await axiosClient.post<Receipt>(
      `/api/v1/sales/${saleId}/partial-return`,
      { items }
    )
    return response.data
  },
}
