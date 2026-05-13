// ES: Modal de búsqueda y selección de clientes
// EN: Customer search and selection modal

import { X } from 'lucide-react'
import { CustomerSearch } from './CustomerSearch'
import type { Customer } from '../../core/types/customer.types'

interface CustomerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void | Promise<void>
  onClearCustomer: () => void | Promise<void>
}

export function CustomerSearchModal({
  isOpen,
  onClose,
  selectedCustomer,
  onSelectCustomer,
  onClearCustomer,
}: CustomerSearchModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="pos-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-search-title"
    >
      <div className="pos-modal-panel flex max-h-[min(90vh,640px)] max-w-lg flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="pos-modal-eyebrow">
              Cliente / Customer
            </p>
            <h2 id="customer-search-title" className="pos-modal-title">
              Buscar cliente / Search customer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pos-modal-close"
            aria-label="Cerrar / Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <CustomerSearch
            selectedCustomer={selectedCustomer}
            onSelectCustomer={onSelectCustomer}
            onClearCustomer={onClearCustomer}
          />
        </div>

        <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="pos-btn-secondary w-full justify-center">
            Cerrar / Close
          </button>
        </div>
      </div>
    </div>
  )
}
