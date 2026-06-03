// ES: ProductPort sobre GET /api/productos (lambda-ventas)
// EN: ProductPort over GET /api/productos (lambda-ventas)

import type { ProductPort } from '../../core/ports/ProductPort'
import type { Product } from '../../core/types/product.types'
import {
  searchLambdaProducts,
  fetchLambdaProductByBarcode,
  mapProductoToProduct,
} from './lambdaCatalogCache'

export const lambdaProductApiAdapter: ProductPort = {
  async searchByName(name: string): Promise<Product[]> {
    const items = await searchLambdaProducts(name)
    return items.map(mapProductoToProduct)
  },

  async searchByBarcode(barcode: string): Promise<Product> {
    const found = await fetchLambdaProductByBarcode(barcode)
    return mapProductoToProduct(found)
  },
}
