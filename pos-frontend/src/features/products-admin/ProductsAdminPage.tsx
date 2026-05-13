// ES: Administración de catálogo de productos (parcial DeCo integrado al POS)
// EN: Product catalog administration (DeCo partial integrated into POS)

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Pencil, Trash2 } from 'lucide-react'
import { useCatalogProducts } from './useCatalogProducts'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { CatalogProductInput } from '../../core/types/catalogProduct.types'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  )
}

function ProductFields({
  values,
  errors,
  onChange,
}: {
  values: CatalogProductInput
  errors: Partial<Record<keyof CatalogProductInput, string>>
  onChange: (next: CatalogProductInput) => void
}) {
  const patch = (partial: Partial<CatalogProductInput>) => onChange({ ...values, ...partial })

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre</label>
        <input
          className="pos-input"
          value={values.nombre}
          onChange={(e) => patch({ nombre: e.target.value })}
        />
        <FieldError message={errors.nombre} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Descripción</label>
        <input
          className="pos-input"
          value={values.descripcion}
          onChange={(e) => patch({ descripcion: e.target.value })}
        />
        <FieldError message={errors.descripcion} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Subcategoría</label>
        <input
          className="pos-input"
          value={values.subcategoria}
          onChange={(e) => patch({ subcategoria: e.target.value })}
        />
        <FieldError message={errors.subcategoria} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Precio</label>
        <input
          className="pos-input"
          type="number"
          min={0}
          step="any"
          value={values.precio || ''}
          onChange={(e) => patch({ precio: Number(e.target.value) })}
        />
        <FieldError message={errors.precio} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Precio x cantidad</label>
        <input
          className="pos-input"
          type="number"
          min={0}
          step="any"
          value={values.precioxcantidad || ''}
          onChange={(e) => patch({ precioxcantidad: Number(e.target.value) })}
        />
        <FieldError message={errors.precioxcantidad} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Estado</label>
        <select
          className="pos-input"
          value={values.estado}
          onChange={(e) => patch({ estado: e.target.value as CatalogProductInput['estado'] })}
        >
          <option value="">— elegir —</option>
          <option value="activo">activo</option>
          <option value="inactivo">inactivo</option>
        </select>
        <FieldError message={errors.estado} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Código de barras</label>
        <input
          className="pos-input"
          value={values.barcode ?? ''}
          onChange={(e) => patch({ barcode: e.target.value })}
          placeholder="Opcional / optional"
        />
        <FieldError message={errors.barcode} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Stock disponible</label>
        <input
          className="pos-input"
          type="number"
          min={0}
          value={values.availableStock ?? 0}
          onChange={(e) => patch({ availableStock: Number(e.target.value) })}
        />
        <FieldError message={errors.availableStock} />
      </div>
    </div>
  )
}

export function ProductsAdminPage() {
  const navigate = useNavigate()
  const {
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
    editOpen,
    applyFilters,
    clearFilters,
    setPage,
    setLimit,
    createProduct,
    openEdit,
    closeEdit,
    saveEdit,
    deleteProduct,
  } = useCatalogProducts()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Catálogo de productos</h1>
              <p className="text-xs text-slate-500">Administración del catálogo integrada al POS</p>
            </div>
          </div>
          <button type="button" className="pos-btn-secondary" onClick={() => navigate('/sale')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a venta
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {globalError && (
          <div className="mb-5">
            <ErrorMessage message={globalError} onRetry={() => undefined} />
          </div>
        )}

        <section className="pos-card mb-8">
          <h2 className="pos-section-title">Agregar producto</h2>
          <p className="mb-4 text-sm text-slate-500">
            Completa la información; los precios deben ser positivos.
          </p>
          <ProductFields values={createForm} errors={createErrors} onChange={setCreateForm} />
          <button
            type="button"
            className="pos-btn-primary mt-4"
            disabled={isSaving}
            onClick={() => void createProduct()}
          >
            Guardar producto
          </button>
        </section>

        <section className="pos-card mb-6">
          <h2 className="pos-section-title">Filtros y búsqueda</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre (contiene)</label>
              <input
                className="pos-input w-48 min-w-[10rem]"
                value={filterDraft.nombre}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Subcategoría</label>
              <select
                className="pos-input w-48 min-w-[10rem]"
                value={filterDraft.subcategoria}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, subcategoria: e.target.value }))}
              >
                <option value="">Todas</option>
                {subcategorias.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Estado</label>
              <select
                className="pos-input w-40"
                value={filterDraft.estado}
                onChange={(e) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    estado: e.target.value as typeof prev.estado,
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="activo">activo</option>
                <option value="inactivo">inactivo</option>
              </select>
            </div>
            <button type="button" className="pos-btn-primary" onClick={applyFilters}>
              Aplicar filtros
            </button>
            <button type="button" className="pos-btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Por página</label>
              <select
                className="pos-input"
                value={query.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </section>

        <section className="pos-card relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <LoadingSpinner label="Cargando lista…" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Subcategoría</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Px cant.</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{row.descripcion}</td>
                    <td className="px-4 py-3">{row.subcategoria}</td>
                    <td className="px-4 py-3">{row.precio.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3">{row.precioxcantidad.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3">{row.availableStock}</td>
                    <td className="px-4 py-3 capitalize">{row.estado}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="pos-btn-secondary !px-2 !py-1.5"
                          onClick={() => openEdit(row)}
                          aria-label={`Editar ${row.nombre}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="pos-btn-danger !px-2 !py-1.5"
                          onClick={() => void deleteProduct(row.id)}
                          aria-label={`Eliminar ${row.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No hay productos con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-sm">
            <p className="text-slate-600">{paginationLabel}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="pos-btn-secondary !py-1.5 text-xs"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="pos-btn-secondary !py-1.5 text-xs"
                disabled={pagination.totalPages === 0 || pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>

      {editOpen && editForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Editar producto</h3>
            <p className="mb-5 text-xs text-slate-500">Modifica los datos y guarda los cambios.</p>
            <ProductFields values={editForm} errors={editErrors} onChange={setEditForm} />
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="pos-btn-secondary" onClick={closeEdit}>
                Cancelar
              </button>
              <button
                type="button"
                className="pos-btn-primary"
                disabled={isSaving}
                onClick={() => void saveEdit()}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
