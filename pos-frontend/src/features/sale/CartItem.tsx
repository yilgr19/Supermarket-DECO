// ES: Componente de ítem del carrito
// EN: Cart item component

import React, { useState } from 'react';
import type { SaleItem } from '../../core/types/sale.types';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface CartItemProps {
  item: SaleItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export default function CartItem({ item, onUpdateQuantity, onRemove, disabled = false }: CartItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      onUpdateQuantity(item.id, value);
    }
  };

  const handleRemoveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmRemove = () => {
    onRemove(item.id);
    setShowConfirm(false);
  };

  return (
    <li className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0">
      {/* ES: Información del producto / EN: Product info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.productName}</p>
        <p className="text-sm text-gray-500">{formatCOP(item.unitPrice)} c/u</p>
      </div>

      {/* ES: Control de cantidad / EN: Quantity control */}
      <div className="flex items-center gap-2">
        <label htmlFor={`qty-${item.id}`} className="sr-only">
          Cantidad de {item.productName} / Quantity of {item.productName}
        </label>
        <input
          id={`qty-${item.id}`}
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={disabled}
          aria-label={`Cantidad de ${item.productName} / Quantity of ${item.productName}`}
          className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[44px]"
        />
      </div>

      {/* ES: Total de línea / EN: Line total */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-gray-900">{formatCOP(item.lineTotal)}</p>
      </div>

      {/* ES: Botón eliminar / EN: Remove button */}
      {!showConfirm ? (
        <button
          onClick={handleRemoveClick}
          disabled={disabled}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
          aria-label={`Eliminar ${item.productName} del carrito / Remove ${item.productName} from cart`}
        >
          🗑️
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            onClick={handleConfirmRemove}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded min-h-[44px] min-w-[44px]"
            aria-label="Confirmar eliminación / Confirm removal"
          >
            ✓
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded min-h-[44px] min-w-[44px]"
            aria-label="Cancelar eliminación / Cancel removal"
          >
            ✗
          </button>
        </div>
      )}
    </li>
  );
}
