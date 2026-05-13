// ES: Catálogo administrable en memoria para MSW
// EN: In-memory admin catalog for MSW

import type { CatalogProduct, CatalogProductInput } from '../core/types/catalogProduct.types'

let seq = 3
const products = new Map<number, CatalogProduct>([
  [
    1,
    {
      id: 1,
      nombre: 'Leche Entera',
      descripcion: 'Leche entera 1L',
      subcategoria: 'Lácteos',
      precio: 2400,
      precioxcantidad: 22000,
      estado: 'activo',
      barcode: '7501234567890',
      availableStock: 50,
    },
  ],
  [
    2,
    {
      id: 2,
      nombre: 'Pan integral',
      descripcion: 'Pan integral tajado 500g',
      subcategoria: 'Panadería',
      precio: 1200,
      precioxcantidad: 10000,
      estado: 'activo',
      barcode: '7509876543210',
      availableStock: 35,
    },
  ],
])

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function mockCatalogList(params: URLSearchParams) {
  const nombre = (params.get('nombre') ?? '').toLowerCase()
  const subcategoria = (params.get('subcategoria') ?? '').toLowerCase()
  const estado = params.get('estado') ?? ''
  let page = Number(params.get('page') ?? '1')
  let limit = Number(params.get('limit') ?? '10')
  if (Number.isNaN(page) || page < 1) page = 1
  if (Number.isNaN(limit) || limit < 1) limit = 10

  let rows = Array.from(products.values())
  if (nombre) rows = rows.filter((p) => p.nombre.toLowerCase().includes(nombre))
  if (subcategoria) rows = rows.filter((p) => p.subcategoria.toLowerCase() === subcategoria)
  if (estado) rows = rows.filter((p) => p.estado === estado)

  const total = rows.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  if (total > 0 && page > totalPages) page = totalPages
  const start = (page - 1) * limit
  const slice = rows.slice(start, start + limit)

  return {
    data: clone(slice),
    pagination: { page, limit, total, totalPages },
  }
}

export function mockCatalogCreate(body: CatalogProductInput) {
  const id = seq++
  const row: CatalogProduct = {
    id,
    nombre: body.nombre,
    descripcion: body.descripcion,
    subcategoria: body.subcategoria,
    precio: body.precio,
    precioxcantidad: body.precioxcantidad,
    estado: body.estado,
    barcode: body.barcode?.trim() || `750${String(id).padStart(10, '0')}`,
    availableStock: body.availableStock ?? 0,
  }
  products.set(id, row)
  return clone(row)
}

export function mockCatalogUpdate(id: number, body: CatalogProductInput) {
  const current = products.get(id)
  if (!current) return null
  const row: CatalogProduct = {
    ...current,
    ...body,
    id,
    barcode: body.barcode?.trim() || current.barcode,
    availableStock: body.availableStock ?? current.availableStock,
  }
  products.set(id, row)
  return clone(row)
}

export function mockCatalogDelete(id: number) {
  return products.delete(id)
}

export function mockCatalogSearchPos(name: string) {
  const needle = name.trim().toLowerCase()
  if (!needle) return []
  return Array.from(products.values())
    .filter((p) => p.estado === 'activo' && p.nombre.toLowerCase().includes(needle))
    .map((p) => ({
      id: String(p.id),
      name: p.nombre,
      barcode: p.barcode,
      unitPrice: p.precio,
      availableStock: p.availableStock,
      category: p.subcategoria,
    }))
}

export function mockCatalogByBarcode(barcode: string) {
  const row = Array.from(products.values()).find(
    (p) => p.barcode === barcode && p.estado === 'activo'
  )
  if (!row) return null
  return {
    id: String(row.id),
    name: row.nombre,
    barcode: row.barcode,
    unitPrice: row.precio,
    availableStock: row.availableStock,
    category: row.subcategoria,
  }
}
