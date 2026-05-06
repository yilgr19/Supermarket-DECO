// ES: Componente de búsqueda de productos por nombre
// EN: Product search component by name

import { useProductSearch } from './useProductSearch';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Product } from '../../core/types/product.types';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface ProductSearchProps {
  onAddProduct: (product: Product) => void;
  disabled?: boolean;
}

export default function ProductSearch({ onAddProduct, disabled = false }: ProductSearchProps) {
  const { query, setQuery, results, isLoading, error } = useProductSearch();

  return (
    <div className="flex flex-col gap-3">
      {/* ES: Campo de búsqueda / EN: Search field */}
      <div className="relative">
        <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Producto / Search Product
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            🔍
          </span>
          <input
            id="product-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre del producto (mín. 2 caracteres) / Product name (min. 2 chars)"
            disabled={disabled}
            aria-label="Buscar producto por nombre / Search product by name"
            aria-busy={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* ES: Estado de carga / EN: Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500">
          <LoadingSpinner size="sm" label="Buscando productos... / Searching products..." />
          <span className="text-sm">Buscando... / Searching...</span>
        </div>
      )}

      {/* ES: Mensaje de error / EN: Error message */}
      {error && !isLoading && (
        <ErrorMessage message={error} />
      )}

      {/* ES: Resultados de búsqueda / EN: Search results */}
      {!isLoading && !error && results.length > 0 && (
        <ul
          className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto"
          aria-label="Resultados de búsqueda / Search results"
        >
          {results.map((product) => (
            <li key={product.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    <span className="mr-3">📦 {product.barcode}</span>
                    <span className="mr-3">💰 {formatCOP(product.unitPrice)}</span>
                    <span className="mr-3">📊 Stock: {product.availableStock}</span>
                    <span>🏷️ {product.category}</span>
                  </p>
                </div>
                <button
                  onClick={() => onAddProduct(product)}
                  disabled={disabled || product.availableStock === 0}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Agregar ${product.name} al carrito / Add ${product.name} to cart`}
                >
                  + Agregar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ES: Sin resultados / EN: No results */}
      {!isLoading && !error && query.length >= 2 && results.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4" role="status">
          No se encontraron productos / No products found
        </p>
      )}
    </div>
  );
}
