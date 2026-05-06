// ES: Badge de estado de la venta / EN: Sale status badge

import type { SaleStatus } from '../../core/types/sale.types'
import type { CreditStatus } from '../../core/types/customer.types'

const saleStatusConfig: Record<SaleStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Activa / Active', className: 'bg-green-100 text-green-800' },
  FROZEN: { label: 'Congelada / Frozen', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completada / Completed', className: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Cancelada / Cancelled', className: 'bg-red-100 text-red-800' },
  RETURNED: { label: 'Devuelta / Returned', className: 'bg-orange-100 text-orange-800' },
  PARTIALLY_RETURNED: {
    label: 'Dev. Parcial / Partial Return',
    className: 'bg-yellow-100 text-yellow-800',
  },
}

const creditStatusConfig: Record<CreditStatus, { label: string; className: string }> = {
  APPROVED: { label: 'Aprobado / Approved', className: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado / Rejected', className: 'bg-red-100 text-red-800' },
  PENDING: { label: 'Pendiente / Pending', className: 'bg-yellow-100 text-yellow-800' },
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function CreditStatusBadge({ status }: CreditStatusBadgeProps) {
  const config = creditStatusConfig[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
