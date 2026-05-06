// ES: Puerto de productos — interfaz de contrato para búsqueda de productos
// EN: Product port — contract interface for product search

import type { Product } from '../types/product.types';

export interface ProductPort {
  searchByName(name: string): Promise<Product[]>;
  searchByBarcode(barcode: string): Promise<Product>;
}
