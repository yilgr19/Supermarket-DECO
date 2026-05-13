// ES: Hook de administración de catálogo (CRUD + filtros + paginación)
// EN: Catalog admin hook (CRUD, filters, pagination)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { catalogProductApiAdapter, CatalogProductApiError } from '../../adapters/http/catalogProductApiAdapter'
import type {
  CatalogProduct,
  CatalogProductInput,
  CatalogProductListFilters,
} from '../../core/types/catalogProduct.types'
import {
  hasCatalogProductErrors,
  validateCatalogProductInput,
} from '../../core/validation/catalogProduct.validation'

const EMPTY_FORM: CatalogProductInput = {
  nombre: '',
  descripcion: '',
  subcategoria: '',
  precio: 0,
  precioxcantidad: 0,
  estado: 'activo',
  barcode: '',
  availableStock: 0,
}

const INITIAL_QUERY: CatalogProductListFilters = {
  nombre: '',
  subcategoria: '',
  estado: '',
  page: 1,
  limit: 10,
}

export function useCatalogProducts() {
  const [filterDraft, setFilterDraft] = useState({ nombre: '', subcategoria: '', estado: '' as const })
  const [query, setQuery] = useState<CatalogProductListFilters>(INITIAL_QUERY)
  const [items, setItems] = useState<CatalogProduct[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [subcategorias, setSubcategorias] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<CatalogProductInput>({ ...EMPTY_FORM })
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CatalogProductInput, string>>>({})
  const [editForm, setEditForm] = useState<CatalogProductInput | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof CatalogProductInput, string>>>({})

  const load = useCallback(async () => {
    setIsLoading(true)
    setGlobalError(null)
    try {
      const page = await catalogProductApiAdapter.list(query)
      setItems(page.data)
      setPagination(page.pagination)
      setSubcategorias((prev) => {
        const seen = new Set(prev)
        for (const row of page.data) {
          if (row.subcategoria) seen.add(row.subcategoria)
        }
        return Array.from(seen).sort((a, b) => a.localeCompare(b, 'es'))
      })
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load()
  }, [load])

  const applyFilters = useCallback(() => {
    setQuery((prev) => ({
      ...prev,
      nombre: filterDraft.nombre,
      subcategoria: filterDraft.subcategoria,
      estado: filterDraft.estado,
      page: 1,
    }))
  }, [filterDraft])

  const clearFilters = useCallback(() => {
    setFilterDraft({ nombre: '', subcategoria: '', estado: '' })
    setQuery((prev) => ({ ...prev, nombre: '', subcategoria: '', estado: '', page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setQuery((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  const createProduct = useCallback(async () => {
    const errors = validateCatalogProductInput(createForm)
    setCreateErrors(errors)
    if (hasCatalogProductErrors(errors)) return false

    setIsSaving(true)
    setGlobalError(null)
    try {
      await catalogProductApiAdapter.create(createForm)
      setCreateForm({ ...EMPTY_FORM })
      setCreateErrors({})
      await load()
      return true
    } catch (err) {
      if (err instanceof CatalogProductApiError && err.details?.length) {
        const mapped: Partial<Record<keyof CatalogProductInput, string>> = {}
        for (const d of err.details) {
          mapped[d.field as keyof CatalogProductInput] = d.message
        }
        setCreateErrors(mapped)
      }
      setGlobalError(err instanceof Error ? err.message : 'No se pudo crear el producto')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [createForm, load])

  const openEdit = useCallback((product: CatalogProduct) => {
    setEditId(product.id)
    setEditErrors({})
    setEditForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      subcategoria: product.subcategoria,
      precio: product.precio,
      precioxcantidad: product.precioxcantidad,
      estado: product.estado,
      barcode: product.barcode,
      availableStock: product.availableStock,
    })
  }, [])

  const closeEdit = useCallback(() => {
    setEditId(null)
    setEditForm(null)
    setEditErrors({})
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editForm || editId == null) return false
    const errors = validateCatalogProductInput(editForm)
    setEditErrors(errors)
    if (hasCatalogProductErrors(errors)) return false

    setIsSaving(true)
    setGlobalError(null)
    try {
      await catalogProductApiAdapter.update(editId, editForm)
      closeEdit()
      await load()
      return true
    } catch (err) {
      if (err instanceof CatalogProductApiError && err.details?.length) {
        const mapped: Partial<Record<keyof CatalogProductInput, string>> = {}
        for (const d of err.details) {
          mapped[d.field as keyof CatalogProductInput] = d.message
        }
        setEditErrors(mapped)
      }
      setGlobalError(err instanceof Error ? err.message : 'No se pudo actualizar el producto')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [closeEdit, editForm, editId, load])

  const deleteProduct = useCallback(
    async (id: number) => {
      if (!window.confirm('¿Eliminar este producto? / Delete this product?')) return
      setIsSaving(true)
      setGlobalError(null)
      try {
        await catalogProductApiAdapter.remove(id)
        await load()
      } catch (err) {
        setGlobalError(err instanceof Error ? err.message : 'No se pudo eliminar el producto')
      } finally {
        setIsSaving(false)
      }
    },
    [load]
  )

  const paginationLabel = useMemo(() => {
    if (pagination.total === 0) {
      return 'Página 0 de 0 — 0 producto(s)'
    }
    return `Página ${pagination.page} de ${pagination.totalPages} — ${pagination.total} producto(s)`
  }, [pagination])

  return {
    filterDraft,
    setFilterDraft,
    query,
    items,
    pagination,
    paginationLabel,
    subcategorias,
    isLoading,
    isSaving,
    globalError,
    createForm,
    setCreateForm,
    createErrors,
    editForm,
    setEditForm,
    editErrors,
    editOpen: editId != null,
    applyFilters,
    clearFilters,
    setPage,
    setLimit,
    createProduct,
    openEdit,
    closeEdit,
    saveEdit,
    deleteProduct,
  }
}
