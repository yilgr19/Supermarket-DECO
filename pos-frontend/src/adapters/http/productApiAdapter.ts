// ES: Adaptador HTTP para la API de productos
// EN: HTTP adapter for the products API

import axiosInstance from '../../infrastructure/http/axiosClient';
import type { ProductPort } from '../../core/ports/ProductPort';
import type { Product } from '../../core/types/product.types';

export const productApiAdapter: ProductPort = {
  // ES: Busca productos por nombre (coincidencia parcial)
  // EN: Searches products by name (partial match)
  async searchByName(name: string): Promise<Product[]> {
    const response = await axiosInstance.get<Product[]>('/api/v1/products/search', {
      params: { name },
    });
    return response.data;
  },

  // ES: Busca un producto por código de barras (exacto)
  // EN: Searches a product by barcode (exact match)
  async searchByBarcode(barcode: string): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/api/v1/products/barcode/${barcode}`);
    return response.data;
  },
};
