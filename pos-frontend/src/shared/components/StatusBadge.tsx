// ES: Badge de estado de la venta / EN: Sale status badge

import type { SaleStatus } from '../../core/types/sale.types'
import type { CreditStatus } from '../../core/types/customer.types'

const neutralBadge = 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
const activeBadge = 'bg-slate-200 text-slate-800 ring-1 ring-slate-300'

const saleStatusConfig: Record<SaleStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Activa / Active',
    className: activeBadge,
  },
  FROZEN: {
    label: 'Congelada / Frozen',
    className: neutralBadge,
  },
  COMPLETED: {
    label: 'Completada / Completed',
    className: neutralBadge,
  },
  CANCELLED: {
    label: 'Cancelada / Cancelled',
    className: neutralBadge,
  },
  RETURNED: {
    label: 'Devuelta / Returned',
    className: neutralBadge,
  },
  PARTIALLY_RETURNED: {
    label: 'Dev. Parcial / Partial Return',
    className: neutralBadge,
  },
}

const creditStatusConfig: Record<CreditStatus, { label: string; className: string }> = {
  APPROVED: {
    label: 'Aprobado / Approved',
    className: activeBadge,
  },
  REJECTED: {
    label: 'Rechazado / Rejected',
    className: neutralBadge,
  },
  PENDING: {
    label: 'Pendiente / Pending',
    className: neutralBadge,
  },
}

interface SaleStatusBadgeProps {
  status: SaleStatus
  variant?: 'default' | 'onDark'
}

interface CreditStatusBadgeProps {
  status: CreditStatus
}

export function SaleStatusBadge({ status, variant = 'default' }: SaleStatusBadgeProps) {
  const config = saleStatusConfig[status]
  if (variant === 'onDark') {
    return (
      <span
        className="inline-flex max-w-[11rem] items-center truncate rounded-full bg-slate-800 px-3 py-1 text-[0.6875rem] font-semibold text-slate-100 ring-1 ring-slate-700"
        title={config.label}
      >
        {config.label}
      </span>
    )
  }
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
