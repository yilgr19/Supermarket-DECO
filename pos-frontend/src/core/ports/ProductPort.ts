// ES: Puerto de dominio para búsqueda de productos
// EN: Domain port for product search

import type { Product } from '../types/product.types'

export interface ProductPort {
  searchByName(name: string): Promise<Product[]>
  searchByBarcode(barcode: string): Promise<Product>
}
