// ES: Formulario de devolución parcial con selección de ítems
// EN: Partial return form with item selection

import React, { useState } from 'react';
import type { Sale } from '../../core/types/sale.types';
import type { ReturnItemRequest } from '../../core/types/sale.types';
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

interface ReturnItemState {
  saleItemId: string;
  quantity: number;
  reason: string;
  maxQuantity: number;
  productName: string;
}

interface PartialReturnFormProps {
  sale: Sale;
  onConfirm: (items: ReturnItemRequest[]) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function PartialReturnForm({ sale, onConfirm, isLoading = false, error }: PartialReturnFormProps) {
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>(
    sale.items.map((item) => ({
      saleItemId: item.id,
      quantity: 0,
      reason: '',
      maxQuantity: item.quantity,
      productName: item.productName,
    }))
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateItem = (index: number, field: 'quantity' | 'reason', value: string | number) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToReturn = returnItems.filter((item) => item.quantity > 0);

    if (itemsToReturn.length === 0) {
      setValidationError('Seleccione al menos un ítem para devolver / Select at least one item to return');
      return;
    }

    // ES: Validar que ítems con cantidad > 0 tengan motivo
    // EN: Validate that items with quantity > 0 have a reason
    const missingReason = itemsToReturn.find((item) => !item.reason.trim());
    if (missingReason) {
      setValidationError(`Ingrese el motivo para "${missingReason.productName}" / Enter reason for "${missingReason.productName}"`);
      return;
    }

    setValidationError(null);
    const requests: ReturnItemRequest[] = itemsToReturn.map((item) => ({
      saleItemId: item.saleItemId,
      quantity: item.quantity,
      reason: item.reason.trim(),
    }));

    await onConfirm(requests);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ES: Lista de ítems / EN: Items list */}
      <div className="space-y-3">
        {returnItems.map((returnItem, index) => {
          const saleItem = sale.items[index];
          return (
            <div key={returnItem.saleItemId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{returnItem.productName}</p>
                  <p className="text-sm text-gray-500">
                    Comprado / Purchased: {returnItem.maxQuantity} — {formatCOP(saleItem.lineTotal)}
                  </p>
                </div>
              </div>

              {/* ES: Cantidad a devolver / EN: Quantity to return */}
              <div className="flex gap-3 items-center mb-3">
                <label htmlFor={`return-qty-${returnItem.saleItemId}`} className="text-sm text-gray-600 min-w-[120px]">
                  Cantidad a devolver / Return qty:
                </label>
                <input
                  id={`return-qty-${returnItem.saleItemId}`}
                  type="number"
                  min="0"
                  max={returnItem.maxQuantity}
                  value={returnItem.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                  disabled={isLoading}
                  aria-label={`Cantidad a devolver de ${returnItem.productName} / Return quantity for ${returnItem.productName}`}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 min-h-[44px]"
                />
                <span className="text-sm text-gray-400">/ {returnItem.maxQuantity}</span>
              </div>

              {/* ES: Motivo por ítem / EN: Per-item reason */}
              {returnItem.quantity > 0 && (
                <div>
                  <label htmlFor={`return-reason-${returnItem.saleItemId}`} className="block text-sm text-gray-600 mb-1">
                    Motivo / Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`return-reason-${returnItem.saleItemId}`}
                    type="text"
                    value={returnItem.reason}
                    onChange={(e) => updateItem(index, 'reason', e.target.value)}
                    placeholder="Motivo de devolución / Return reason"
                    disabled={isLoading}
                    aria-label={`Motivo de devolución para ${returnItem.productName} / Return reason for ${returnItem.productName}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 min-h-[44px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {validationError && <ErrorMessage message={validationError} />}
      {error && <ErrorMessage message={error} />}

      {/* ES: Botón confirmar / EN: Confirm button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px] disabled:opacity-50"
        aria-label="Confirmar devolución parcial / Confirm partial return"
      >
        {isLoading ? 'Procesando...' : '↩️ Confirmar Devolución Parcial / Confirm Partial Return'}
      </button>
    </form>
  );
}
