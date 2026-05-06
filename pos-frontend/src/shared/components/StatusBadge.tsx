// ES: Badge de estado de la venta / EN: Sale status badge

import type { SaleStatus } from '../../core/types/sale.types'
import type { CreditStatus } from '../../core/types/customer.types'

const saleStatusConfig: Record<SaleStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Activa / Active',
    className:
      'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
  },
  FROZEN: {
    label: 'Congelada / Frozen',
    className: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80',
  },
  COMPLETED: {
    label: 'Completada / Completed',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  },
  CANCELLED: {
    label: 'Cancelada / Cancelled',
    className: 'bg-red-50 text-red-800 ring-1 ring-red-200/80',
  },
  RETURNED: {
    label: 'Devuelta / Returned',
    className: 'bg-orange-50 text-orange-900 ring-1 ring-orange-200/80',
  },
  PARTIALLY_RETURNED: {
    label: 'Dev. Parcial / Partial Return',
    className: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/70',
  },
}

const creditStatusConfig: Record<CreditStatus, { label: string; className: string }> = {
  APPROVED: {
    label: 'Aprobado / Approved',
    className:
      'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
  },
  REJECTED: {
    label: 'Rechazado / Rejected',
    className:
      'bg-red-50 text-red-800 ring-1 ring-red-200/80',
  },
  PENDING: {
    label: 'Pendiente / Pending',
    className:
      'bg-amber-50 text-amber-900 ring-1 ring-amber-200/70',
  },
}

interface SaleStatusBadgeProps {
  status: SaleStatus
}

interface CreditStatusBadgeProps {
  status: CreditStatus
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  const config = saleStatusConfig[status]
  return (
    <span
      className={`inline-flex max-w-[11rem] items-center truncate rounded-full px-3 py-1 text-[0.6875rem] font-semibold ${config.className}`}
      title={config.label}
    >
      {config.label}
    </span>
  )
}

export function CreditStatusBadge({ status }: CreditStatusBadgeProps) {
  const config = creditStatusConfig[status]
  return (
    <span
      className={`mt-1 inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
