// ES: ProductPort sobre GET /api/productos (lambda-ventas)
// EN: ProductPort over GET /api/productos (lambda-ventas)

import type { ProductPort } from '../../core/ports/ProductPort'
import type { Product } from '../../core/types/product.types'
import { endpoints } from '../../config/api'
import { lambdaFetch } from '../../infrastructure/http/lambdaFetch'
import { ApiError } from '../../infrastructure/http/ApiError'
import type { ProductoLambda } from '../../core/types/lambda.types'
import {
  loadLambdaCatalog,
  mapProductoToProduct,
} from './lambdaCatalogCache'

export const lambdaProductApiAdapter: ProductPort = {
  async searchByName(name: string): Promise<Product[]> {
    const q = name.trim().toLowerCase()
    const items = await loadLambdaCatalog()
    return items
      .filter((p) => p.nombre.toLowerCase().includes(q))
      .map(mapProductoToProduct)
  },

  async searchByBarcode(barcode: string): Promise<Product> {
    const code = barcode.trim()
    const items = await loadLambdaCatalog()
    const found =
      items.find((p) => p.codigo_barras === code) ??
      items.find((p) => p.id === code)
    if (found) return mapProductoToProduct(found)

    try {
      const one = await lambdaFetch<ProductoLambda>(endpoints.producto(code))
      return mapProductoToProduct(one)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        throw new ApiError(404, 'Producto no encontrado / Product not found')
      }
      throw err
    }
  },
}
