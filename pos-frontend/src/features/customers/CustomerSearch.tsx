// ES: Componente de búsqueda y selección de clientes
// EN: Customer search and selection component

import { type KeyboardEvent } from 'react'
import { UserSearch, UserCheck } from 'lucide-react'
import { useCustomerSearch } from './useCustomerSearch'
import { CreditStatusBadge } from '../../shared/components/StatusBadge'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Customer } from '../../core/types/customer.types'

interface CustomerSearchProps {
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void | Promise<void>
  onClearCustomer: () => void | Promise<void>
}

export function CustomerSearch({
  selectedCustomer,
  onSelectCustomer,
  onClearCustomer,
}: CustomerSearchProps) {
  const { query, setQuery, mode, setMode, results, isLoading, error, searchByDocument } =
    useCustomerSearch()

  const handleDocKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      searchByDocument(query.trim())
    }
  }

  if (selectedCustomer) {
    return (
      <div className="pos-selected-panel">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="pos-icon-badge h-11 w-11">
              <UserCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selectedCustomer.fullName}</p>
              <p className="text-xs text-slate-500">
                {selectedCustomer.documentType}: {selectedCustomer.documentNumber}
              </p>
              <CreditStatusBadge status={selectedCustomer.creditStatus} />
            </div>
          </div>
          <button
            onClick={onClearCustomer}
            className="min-h-[40px] min-w-[40px] rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Quitar cliente / Remove customer"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1">
        <button
          type="button"
          onClick={() => setMode('name')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition ${
            mode === 'name'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={mode === 'name'}
        >
          Por nombre
        </button>
        <button
          type="button"
          onClick={() => setMode('document')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition ${
            mode === 'document'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={mode === 'document'}
        >
          Por documento
        </button>
      </div>

      <div className="relative">
        <UserSearch
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type={mode === 'document' ? 'text' : 'search'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={mode === 'document' ? handleDocKeyDown : undefined}
          placeholder={
            mode === 'name'
              ? 'Buscar cliente / Search customer...'
              : 'Documento ↵ / Document (Enter)'
          }
          className="pos-input-search py-2.5 text-sm"
          aria-label={
            mode === 'name'
              ? 'Buscar cliente por nombre / Search customer by name'
              : 'Buscar cliente por documento / Search customer by document'
          }
        />
      </div>

      {isLoading && <LoadingSpinner size="sm" />}
      {error && <ErrorMessage message={error} />}

      {results.length > 0 && (
        <ul className="pos-list max-h-48 overflow-y-auto">
          {results.map((customer) => (
            <li
              key={customer.id}
              className="pos-list-row !py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{customer.fullName}</p>
                <p className="text-xs text-slate-500">
                  {customer.documentType}: {customer.documentNumber}
                </p>
                <CreditStatusBadge status={customer.creditStatus} />
              </div>
              <button
                type="button"
                onClick={() => onSelectCustomer(customer)}
                className="pos-btn-primary min-h-[40px] px-3 text-xs"
                aria-label={`Seleccionar ${customer.fullName} / Select ${customer.fullName}`}
              >
                OK
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
