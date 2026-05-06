// ES: Badge de estado para ventas y clientes
// EN: Status badge for sales and customers

import type { SaleStatus } from '../../core/types/sale.types';
import type { CreditStatus } from '../../core/types/customer.types';

type Status = SaleStatus | CreditStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // ES: Estados de venta / EN: Sale statuses
  ACTIVE: { label: 'Activa / Active', className: 'bg-green-100 text-green-800' },
  FROZEN: { label: 'Congelada / Frozen', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completada / Completed', className: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Cancelada / Cancelled', className: 'bg-red-100 text-red-800' },
  RETURNED: { label: 'Devuelta / Returned', className: 'bg-orange-100 text-orange-800' },
  PARTIALLY_RETURNED: { label: 'Dev. Parcial / Partial Return', className: 'bg-yellow-100 text-yellow-800' },
  // ES: Estados de crédito / EN: Credit statuses
  APPROVED: { label: 'Aprobado / Approved', className: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado / Rejected', className: 'bg-red-100 text-red-800' },
  PENDING: { label: 'Pendiente / Pending', className: 'bg-yellow-100 text-yellow-800' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
      aria-label={`Estado: ${config.label} / Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
