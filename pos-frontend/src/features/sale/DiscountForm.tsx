// ES: Formulario para aplicar descuentos a la venta
// EN: Form for applying discounts to the sale

import React, { useState } from 'react';
import type { DiscountType } from '../../core/types/sale.types';
import ErrorMessage from '../../shared/components/ErrorMessage';

interface DiscountFormProps {
  onApplyDiscount: (type: DiscountType, value: number) => Promise<void>;
  onRemoveDiscount: () => Promise<void>;
  hasDiscount: boolean;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export default function DiscountForm({
  onApplyDiscount,
  onRemoveDiscount,
  hasDiscount,
  isLoading = false,
  error,
  disabled = false,
}: DiscountFormProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setValidationError('El valor debe ser mayor a 0 / Value must be greater than 0');
      return;
    }

    if (discountType === 'PERCENTAGE' && numValue > 100) {
      setValidationError('El porcentaje no puede superar 100% / Percentage cannot exceed 100%');
      return;
    }

    await onApplyDiscount(discountType, numValue);
    setValue('');
  };

  const handleRemove = async () => {
    await onRemoveDiscount();
    setValue('');
    setValidationError(null);
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Descuento / Discount
      </h3>

      <form onSubmit={handleApply} className="space-y-3">
        {/* ES: Toggle tipo de descuento / EN: Discount type toggle */}
        <div className="flex gap-2" role="group" aria-label="Tipo de descuento / Discount type">
          <button
            type="button"
            onClick={() => setDiscountType('PERCENTAGE')}
            disabled={disabled || isLoading}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              discountType === 'PERCENTAGE'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
            aria-pressed={discountType === 'PERCENTAGE'}
            aria-label="Descuento porcentual / Percentage discount"
          >
            % Porcentaje
          </button>
          <button
            type="button"
            onClick={() => setDiscountType('FIXED_AMOUNT')}
            disabled={disabled || isLoading}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              discountType === 'FIXED_AMOUNT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
            aria-pressed={discountType === 'FIXED_AMOUNT'}
            aria-label="Descuento monto fijo / Fixed amount discount"
          >
            $ Monto Fijo
          </button>
        </div>

        {/* ES: Input de valor / EN: Value input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="discount-value" className="sr-only">
              Valor del descuento / Discount value
            </label>
            <input
              id="discount-value"
              type="number"
              min="0.01"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={discountType === 'PERCENTAGE' ? '0-100%' : 'Monto / Amount'}
              disabled={disabled || isLoading}
              aria-label="Valor del descuento / Discount value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || isLoading || !value}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50"
            aria-label="Aplicar descuento / Apply discount"
          >
            {isLoading ? '...' : 'Aplicar'}
          </button>
        </div>

        {/* ES: Errores de validación / EN: Validation errors */}
        {validationError && <ErrorMessage message={validationError} />}
        {error && <ErrorMessage message={error} />}

        {/* ES: Botón remover descuento / EN: Remove discount button */}
        {hasDiscount && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isLoading}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors min-h-[44px]"
            aria-label="Remover descuento / Remove discount"
          >
            ✕ Remover Descuento / Remove Discount
          </button>
        )}
      </form>
    </div>
  );
}
