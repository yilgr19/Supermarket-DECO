// ES: Componente de búsqueda y selección de clientes
// EN: Customer search and selection component

import { useCustomerSearch } from './useCustomerSearch';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Customer } from '../../core/types/customer.types';

interface CustomerSearchProps {
  disabled?: boolean;
}

export default function CustomerSearch({ disabled = false }: CustomerSearchProps) {
  const { query, setQuery, searchMode, setSearchMode, results, isLoading, error } = useCustomerSearch();
  const { selectedCustomer, setSelectedCustomer } = useSaleStore();

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setQuery('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-gray-700">
        Cliente / Customer
      </h3>

      {/* ES: Cliente seleccionado / EN: Selected customer */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{selectedCustomer.fullName}</p>
            <p className="text-sm text-gray-500">
              {selectedCustomer.documentType}: {selectedCustomer.documentNumber}
            </p>
            <StatusBadge status={selectedCustomer.creditStatus} className="mt-1" />
          </div>
          <button
            onClick={handleClearCustomer}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Quitar cliente / Remove customer"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          {/* ES: Toggle modo de búsqueda / EN: Search mode toggle */}
          <div className="flex gap-2" role="group" aria-label="Modo de búsqueda / Search mode">
            <button
              type="button"
              onClick={() => setSearchMode('name')}
              disabled={disabled}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                searchMode === 'name'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
              aria-pressed={searchMode === 'name'}
              aria-label="Buscar por nombre / Search by name"
            >
              Por Nombre
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('document')}
              disabled={disabled}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                searchMode === 'document'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
              aria-pressed={searchMode === 'document'}
              aria-label="Buscar por documento / Search by document"
            >
              Por Documento
            </button>
          </div>

          {/* ES: Campo de búsqueda / EN: Search field */}
          <div className="relative">
            <label htmlFor="customer-search" className="sr-only">
              {searchMode === 'name'
                ? 'Buscar cliente por nombre / Search customer by name'
                : 'Buscar cliente por documento / Search customer by document'}
            </label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              👤
            </span>
            <input
              id="customer-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchMode === 'name'
                  ? 'Nombre del cliente / Customer name'
                  : 'Número de documento / Document number'
              }
              disabled={disabled}
              aria-label={
                searchMode === 'name'
                  ? 'Buscar cliente por nombre / Search customer by name'
                  : 'Buscar cliente por documento / Search customer by document'
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* ES: Estado de carga / EN: Loading state */}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <LoadingSpinner size="sm" label="Buscando clientes... / Searching customers..." />
              <span className="text-sm">Buscando... / Searching...</span>
            </div>
          )}

          {/* ES: Error / EN: Error */}
          {error && !isLoading && <ErrorMessage message={error} />}

          {/* ES: Resultados / EN: Results */}
          {!isLoading && !error && results.length > 0 && (
            <ul
              className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto"
              aria-label="Resultados de clientes / Customer results"
            >
              {results.map((customer) => (
                <li key={customer.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{customer.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {customer.documentType}: {customer.documentNumber}
                      </p>
                      <StatusBadge status={customer.creditStatus} className="mt-1" />
                    </div>
                    <button
                      onClick={() => handleSelect(customer)}
                      disabled={disabled}
                      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      aria-label={`Seleccionar cliente ${customer.fullName} / Select customer ${customer.fullName}`}
                    >
                      Seleccionar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* ES: Sin resultados / EN: No results */}
          {!isLoading && !error && query.length >= 2 && results.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-2" role="status">
              No se encontraron clientes / No customers found
            </p>
          )}

          {/* ES: Sin cliente seleccionado / EN: No customer selected */}
          {!query && (
            <p className="text-gray-400 text-xs text-center">
              Sin cliente / No customer (opcional para efectivo / optional for cash)
            </p>
          )}
        </>
      )}
    </div>
  );
}
