// ES: Puerto de dominio para administración de catálogo
// EN: Domain port for catalog administration

import type {
  CatalogProduct,
  CatalogProductInput,
  CatalogProductListFilters,
  CatalogProductPage,
} from '../types/catalogProduct.types'

export interface CatalogProductPort {
  list(filters: CatalogProductListFilters): Promise<CatalogProductPage>
  create(input: CatalogProductInput): Promise<CatalogProduct>
  update(id: number, input: CatalogProductInput): Promise<CatalogProduct>
  remove(id: number): Promise<void>
}
