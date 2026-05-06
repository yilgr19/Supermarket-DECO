// ES: Adaptador HTTP para la Product API
// EN: HTTP adapter for the Product API

import axiosClient from '../../infrastructure/http/axiosClient'
import type { ProductPort } from '../../core/ports/ProductPort'
import type { Product } from '../../core/types/product.types'

export const productApiAdapter: ProductPort = {
  async searchByName(name: string): Promise<Product[]> {
    const response = await axiosClient.get<Product[]>('/api/v1/products/search', {
      params: { name },
    })
    return response.data
  },

  async searchByBarcode(barcode: string): Promise<Product> {
    const response = await axiosClient.get<Product>(`/api/v1/products/barcode/${barcode}`)
    return response.data
  },
}
