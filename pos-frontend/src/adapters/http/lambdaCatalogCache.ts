// ES: Caché en memoria del catálogo Lambda (GET /api/productos)
// EN: In-memory cache for Lambda catalog

import { endpoints } from '../../config/api'
import { lambdaFetch } from '../../infrastructure/http/lambdaFetch'
import type { ProductoLambda } from '../../core/types/lambda.types'
import type { Product } from '../../core/types/product.types'

let catalog: ProductoLambda[] | null = null

export function invalidateLambdaCatalog(): void {
  catalog = null
}

export async function loadLambdaCatalog(force = false): Promise<ProductoLambda[]> {
  if (force || !catalog) {
    catalog = await lambdaFetch<ProductoLambda[]>(endpoints.productos)
  }
  return catalog
}

export function mapProductoToProduct(p: ProductoLambda): Product {
  return {
    id: p.id,
    name: p.nombre,
    barcode: p.codigo_barras?.trim() || p.id,
    unitPrice: Number(p.precio),
    availableStock: Number(p.stock_disponible ?? 0),
    category: p.descripcion?.trim() || '',
  }
}
