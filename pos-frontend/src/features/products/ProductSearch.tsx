// ES: Componente de búsqueda de productos por nombre
// EN: Product search component by name

import { Search, Plus } from 'lucide-react'
import { useProductSearch } from './useProductSearch'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Product } from '../../core/types/product.types'

interface ProductSearchProps {
  onAddProduct: (product: Product) => void
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const { query, setQuery, results, isLoading, error } = useProductSearch()

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto / Search..."
          className="pos-input-search text-base"
          aria-label="Buscar producto por nombre / Search product by name"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" label="Buscando productos..." />
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {!isLoading && query.length >= 2 && results.length === 0 && !error && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-6 text-center text-sm text-slate-500">
          Sin resultados / No products found
        </p>
      )}

      {results.length > 0 && (
        <ul className="pos-list">
          {results.map((product) => (
            <li
              key={product.id}
              className="pos-list-row"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.barcode} · <span className="text-slate-600">{product.category}</span>
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  ${product.unitPrice.toLocaleString('es-CO')}
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Stock {product.availableStock}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onAddProduct(product)}
                disabled={product.availableStock === 0}
                className="pos-btn-icon"
                aria-label={`Agregar ${product.name} / Add ${product.name}`}
                type="button"
              >
                <Plus className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
