// ES: Adaptador HTTP del catálogo administrable
// EN: HTTP adapter for catalog administration

import { isAxiosError } from 'axios'
import axiosClient from '../../infrastructure/http/axiosClient'
import type { CatalogProductPort } from '../../core/ports/CatalogProductPort'
import type {
  CatalogProduct,
  CatalogProductFieldError,
  CatalogProductInput,
  CatalogProductListFilters,
  CatalogProductPage,
} from '../../core/types/catalogProduct.types'

export class CatalogProductApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: CatalogProductFieldError[]
  ) {
    super(message)
    this.name = 'CatalogProductApiError'
  }
}

function toPayload(input: CatalogProductInput) {
  return {
    nombre: input.nombre,
    descripcion: input.descripcion,
    subcategoria: input.subcategoria,
    precio: input.precio,
    precioxcantidad: input.precioxcantidad,
    estado: input.estado,
    ...(input.barcode?.trim() ? { barcode: input.barcode.trim() } : {}),
    ...(input.availableStock !== undefined ? { availableStock: input.availableStock } : {}),
  }
}

function mapAxiosError(err: unknown): never {
  if (isAxiosError(err) && err.response) {
    const { status, data } = err.response
    const message = data?.error?.message || data?.message || `HTTP ${status}`
    const details = data?.error?.details as CatalogProductFieldError[] | undefined
    throw new CatalogProductApiError(message, status, details)
  }
  if (err instanceof Error) {
    throw err
  }
  throw new Error('Error desconocido / Unknown error')
}

export const catalogProductApiAdapter: CatalogProductPort = {
  async list(filters: CatalogProductListFilters): Promise<CatalogProductPage> {
    try {
      const response = await axiosClient.get<CatalogProductPage>('/api/v1/products', {
        params: {
          page: filters.page,
          limit: filters.limit,
          ...(filters.nombre?.trim() ? { nombre: filters.nombre.trim() } : {}),
          ...(filters.subcategoria ? { subcategoria: filters.subcategoria } : {}),
          ...(filters.estado ? { estado: filters.estado } : {}),
        },
      })
      return response.data
    } catch (err) {
      mapAxiosError(err)
    }
  },

  async create(input: CatalogProductInput): Promise<CatalogProduct> {
    try {
      const response = await axiosClient.post<{ data: CatalogProduct }>(
        '/api/v1/products',
        toPayload(input)
      )
      return response.data.data
    } catch (err) {
      mapAxiosError(err)
    }
  },

  async update(id: number, input: CatalogProductInput): Promise<CatalogProduct> {
    try {
      const response = await axiosClient.put<{ data: CatalogProduct }>(
        `/api/v1/products/${id}`,
        toPayload(input)
      )
      return response.data.data
    } catch (err) {
      mapAxiosError(err)
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/api/v1/products/${id}`)
    } catch (err) {
      mapAxiosError(err)
    }
  },
}
