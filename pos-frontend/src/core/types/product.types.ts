// ES: Tipos del dominio de productos / EN: Product domain types

export interface Product {
  id: string
  name: string
  barcode: string
  unitPrice: number
  availableStock: number
  category: string
}
