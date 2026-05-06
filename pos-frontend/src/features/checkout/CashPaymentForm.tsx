// ES: Formulario de pago en efectivo con cálculo de vuelto en tiempo real
// EN: Cash payment form with real-time change calculation

import React, { useState } from 'react';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface CashPaymentFormProps {
  total: number;
  onAmountChange: (amount: number) => void;
  disabled?: boolean;
}

export default function CashPaymentForm({ total, onAmountChange, disabled = false }: CashPaymentFormProps) {
  const [amountReceived, setAmountReceived] = useState('');

  const numAmount = parseFloat(amountReceived) || 0;
  const change = numAmount >= total ? numAmount - total : 0;
  const isValid = numAmount >= total;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountReceived(value);
    const num = parseFloat(value) || 0;
    onAmountChange(num);
  };

  return (
    <div className="space-y-4">
      {/* ES: Total a pagar / EN: Total to pay */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Total a Pagar / Total to Pay</p>
        <p className="text-3xl font-bold text-gray-900">{formatCOP(total)}</p>
      </div>

      {/* ES: Monto recibido / EN: Amount received */}
      <div>
        <label htmlFor="amount-received" className="block text-sm font-medium text-gray-700 mb-2">
          Monto Recibido / Amount Received
        </label>
        <input
          id="amount-received"
          type="number"
          min={total}
          step="100"
          value={amountReceived}
          onChange={handleChange}
          placeholder={`Mínimo ${formatCOP(total)}`}
          disabled={disabled}
          aria-label="Monto recibido del cliente / Amount received from customer"
          aria-describedby="change-display"
          className={`w-full px-4 py-3 border rounded-lg text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            amountReceived && !isValid ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {amountReceived && !isValid && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            El monto debe ser ≥ {formatCOP(total)} / Amount must be ≥ {formatCOP(total)}
          </p>
        )}
      </div>

      {/* ES: Vuelto calculado / EN: Calculated change */}
      <div
        id="change-display"
        className={`rounded-lg p-4 text-center ${isValid && numAmount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
        aria-live="polite"
        aria-label={`Vuelto: ${formatCOP(change)} / Change: ${formatCOP(change)}`}
      >
        <p className="text-sm text-gray-500 mb-1">Vuelto / Change</p>
        <p className={`text-3xl font-bold ${isValid && numAmount > 0 ? 'text-green-700' : 'text-gray-400'}`}>
          {formatCOP(change)}
        </p>
      </div>
    </div>
  );
}
