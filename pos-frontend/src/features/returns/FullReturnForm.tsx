// ES: Formulario de devolución total
// EN: Full return form

import React, { useState } from 'react';
import type { Sale } from '../../core/types/sale.types';
import ErrorMessage from '../../shared/components/ErrorMessage';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface FullReturnFormProps {
  sale: Sale;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function FullReturnForm({ sale, onConfirm, isLoading = false, error }: FullReturnFormProps) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setValidationError('El motivo es requerido / Reason is required');
      return;
    }
    setValidationError(null);
    await onConfirm(reason.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ES: Resumen de la venta / EN: Sale summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">
          Resumen de la Venta / Sale Summary
        </h3>
        <p className="text-sm text-gray-600">
          {sale.items.length} ítem(s) — Total: {formatCOP(sale.total)}
        </p>
        <ul className="mt-2 text-sm text-gray-500 space-y-1">
          {sale.items.map((item) => (
            <li key={item.id}>
              {item.productName} x{item.quantity} — {formatCOP(item.lineTotal)}
            </li>
          ))}
        </ul>
      </div>

      {/* ES: Campo de motivo / EN: Reason field */}
      <div>
        <label htmlFor="full-return-reason" className="block text-sm font-medium text-gray-700 mb-2">
          Motivo de devolución / Return reason <span className="text-red-500">*</span>
        </label>
        <textarea
          id="full-return-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setValidationError(null);
          }}
          placeholder="Ingrese el motivo de la devolución / Enter return reason"
          rows={3}
          disabled={isLoading}
          aria-label="Motivo de devolución / Return reason"
          aria-invalid={!!validationError}
          className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none disabled:bg-gray-100 ${
            validationError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationError && (
          <p className="text-sm text-red-600 mt-1" role="alert">{validationError}</p>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* ES: Botón confirmar / EN: Confirm button */}
      <button
        type="submit"
        disabled={isLoading || !reason.trim()}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px] disabled:opacity-50"
        aria-label="Confirmar devolución total / Confirm full return"
      >
        {isLoading ? 'Procesando...' : '↩️ Confirmar Devolución Total / Confirm Full Return'}
      </button>
    </form>
  );
}
