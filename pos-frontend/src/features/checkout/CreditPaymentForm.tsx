// ES: Formulario de pago a crédito — muestra cliente y estado de crédito
// EN: Credit payment form — shows customer and credit status

import StatusBadge from '../../shared/components/StatusBadge';
import type { Customer } from '../../core/types/customer.types';

interface CreditPaymentFormProps {
  customer: Customer | null;
  total: number;
}

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CreditPaymentForm({ customer, total }: CreditPaymentFormProps) {
  const isApproved = customer?.creditStatus === 'APPROVED';

  return (
    <div className="space-y-4">
      {/* ES: Total a pagar / EN: Total to pay */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Total a Pagar / Total to Pay</p>
        <p className="text-3xl font-bold text-gray-900">{formatCOP(total)}</p>
      </div>

      {/* ES: Información del cliente / EN: Customer information */}
      {customer ? (
        <div className={`rounded-lg p-4 border ${isApproved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{customer.fullName}</p>
              <p className="text-sm text-gray-500">
                {customer.documentType}: {customer.documentNumber}
              </p>
              <div className="mt-2">
                <StatusBadge status={customer.creditStatus} />
              </div>
            </div>
            <span className="text-2xl" aria-hidden="true">
              {isApproved ? '✅' : '❌'}
            </span>
          </div>

          {/* ES: Advertencia si crédito no aprobado / EN: Warning if credit not approved */}
          {!isApproved && (
            <div
              className="mt-3 p-3 bg-red-100 rounded-lg"
              role="alert"
              aria-label="Crédito no aprobado / Credit not approved"
            >
              <p className="text-sm text-red-700 font-medium">
                ⚠️ El crédito del cliente no está aprobado. No se puede procesar el pago a crédito.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Customer credit is not approved. Credit payment cannot be processed.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ES: Sin cliente seleccionado / EN: No customer selected */
        <div
          className="rounded-lg p-4 bg-yellow-50 border border-yellow-200"
          role="alert"
          aria-label="Cliente requerido / Customer required"
        >
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Se requiere un cliente para pago a crédito.
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            A customer is required for credit payment. Please search and select a customer first.
          </p>
        </div>
      )}
    </div>
  );
}
