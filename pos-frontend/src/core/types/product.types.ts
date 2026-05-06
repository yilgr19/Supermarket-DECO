// ES: Tipos para productos del catálogo
// EN: Types for catalog products

export interface Product {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
  availableStock: number;
  category: string;
}
