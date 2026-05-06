// ES: Resumen cliente y estado de crédito en checkout EN: Customer summary for credit checkout

import type { Customer } from '../../core/types/customer.types'
import { CreditStatusBadge } from '../../shared/components/StatusBadge'

interface CreditPaymentFormProps {
  selectedCustomer: Customer | null
}

export function CreditPaymentForm({ selectedCustomer }: CreditPaymentFormProps) {
  return (
    <div className="flex flex-col gap-3">
      {selectedCustomer ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="font-semibold text-slate-900">{selectedCustomer.fullName}</p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedCustomer.documentType}: {selectedCustomer.documentNumber}
          </p>
          <div className="mt-2">
            <CreditStatusBadge status={selectedCustomer.creditStatus} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white p-4 text-sm text-amber-900 shadow-sm">
          Se requiere un cliente para crédito. / Customer required for credit.
        </div>
      )}
      {selectedCustomer && selectedCustomer.creditStatus !== 'APPROVED' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Crédito no aprobado. / Credit not approved.
        </div>
      )}
    </div>
  )
}
