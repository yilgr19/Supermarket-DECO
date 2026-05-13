// ES: Tipos del catálogo administrable (parcial DeCo + POS)
// EN: Admin catalog product types

export type CatalogProductStatus = 'activo' | 'inactivo'

export interface CatalogProduct {
  id: number
  nombre: string
  descripcion: string
  subcategoria: string
  precio: number
  precioxcantidad: number
  estado: CatalogProductStatus
  barcode: string
  availableStock: number
}

export interface CatalogProductInput {
  nombre: string
  descripcion: string
  subcategoria: string
  precio: number
  precioxcantidad: number
  estado: CatalogProductStatus
  barcode?: string
  availableStock?: number
}

export interface CatalogProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CatalogProductPage {
  data: CatalogProduct[]
  pagination: CatalogProductPagination
}

export interface CatalogProductFieldError {
  field: string
  message: string
}

export interface CatalogProductListFilters {
  nombre?: string
  subcategoria?: string
  estado?: CatalogProductStatus | ''
  page: number
  limit: number
}
