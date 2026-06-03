// ES: Cliente Lambda productos — búsqueda filtrada y GET por id (sin catálogo completo en venta)
// EN: Lambda products client — filtered search and GET by id (no full catalog on sale)

import { endpoints } from '../../config/api'
import { lambdaFetch } from '../../infrastructure/http/lambdaFetch'
import type { ProductoLambda } from '../../core/types/lambda.types'
import type { Product } from '../../core/types/product.types'

let fullCatalog: ProductoLambda[] | null = null

export function invalidateLambdaCatalog(): void {
  fullCatalog = null
}

/** Solo admin/catálogo: GET /api/productos?all=true */
export async function loadLambdaCatalog(force = false): Promise<ProductoLambda[]> {
  if (force || !fullCatalog) {
    fullCatalog = await lambdaFetch<ProductoLambda[]>(`${endpoints.productos}?all=true`)
  }
  return fullCatalog
}

/** GET /api/productos/{id} — un producto al agregar al carrito. */
export async function fetchLambdaProductById(id: string): Promise<ProductoLambda> {
  return lambdaFetch<ProductoLambda>(endpoints.producto(id))
}

/** GET /api/productos?q=... — solo coincidencias de búsqueda. */
export async function searchLambdaProducts(q: string): Promise<ProductoLambda[]> {
  const term = q.trim()
  if (term.length < 2) return []
  return lambdaFetch<ProductoLambda[]>(
    `${endpoints.productos}?q=${encodeURIComponent(term)}`
  )
}

/** GET /api/productos?codigo_barras=... — un producto. */
export async function fetchLambdaProductByBarcode(code: string): Promise<ProductoLambda> {
  return lambdaFetch<ProductoLambda>(
    `${endpoints.productos}?codigo_barras=${encodeURIComponent(code.trim())}`
  )
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
