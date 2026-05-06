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
  onSelectCustomer: (customer: Customer) => void
  onClearCustomer: () => void
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
      <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-slate-50/80 p-4 shadow-inner shadow-emerald-100/40">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
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
              ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200/60'
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
              ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={mode === 'document'}
        >
          Por documento
        </button>
      </div>

      <div className="relative">
        <UserSearch
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"
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
              className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl hover:bg-violet-50/40"
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
                className="min-h-[40px] rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-3 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
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
