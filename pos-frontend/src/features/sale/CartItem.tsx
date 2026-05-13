// ES: Componente de línea de venta en el carrito
// EN: Sale line item component in the cart

import { useState } from 'react'
import { Tag, Trash2 } from 'lucide-react'
import { DiscountForm } from './DiscountForm'
import type { SaleItem } from '../../core/types/sale.types'
import type { DiscountType } from '../../core/types/sale.types'

interface CartItemProps {
  item: SaleItem
  isEditable: boolean
  isLoading: boolean
  discountError: string | null
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRequestRemove: (item: SaleItem) => void
  onApplyDiscount: (type: DiscountType, value: number) => void
  onRemoveDiscount: () => void
}

export function CartItemRow({
  item,
  isEditable,
  isLoading,
  discountError,
  onUpdateQuantity,
  onRequestRemove,
  onApplyDiscount,
  onRemoveDiscount,
}: CartItemProps) {
  const [showDiscount, setShowDiscount] = useState(false)
  const gross = item.unitPrice * item.quantity
  const hasDiscount = (item.discount ?? 0) > 0

  return (
    <li className="py-3.5 transition first:pt-2">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 border-l-[3px] border-violet-400 pl-3">
          <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
          <p className="text-xs text-slate-500">${item.unitPrice.toLocaleString('es-CO')} · unidad</p>
          {hasDiscount && (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              Descuento −${(item.discount ?? 0).toLocaleString('es-CO')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (val >= 1) onUpdateQuantity(item.id, val)
            }}
            disabled={!isEditable}
            className="w-[4.25rem] rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-medium tabular-nums text-slate-900 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 disabled:bg-slate-100 disabled:text-slate-400"
            aria-label={`Cantidad de ${item.productName} / Quantity of ${item.productName}`}
          />

          <div className="w-[5.75rem] text-right">
            {hasDiscount && (
              <p className="text-xs text-slate-400 line-through tabular-nums">
                ${gross.toLocaleString('es-CO')}
              </p>
            )}
            <p className="text-sm font-bold tabular-nums text-slate-900">
              ${item.lineTotal.toLocaleString('es-CO')}
            </p>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => setShowDiscount((open) => !open)}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition ${
                showDiscount || hasDiscount
                  ? 'bg-violet-50 text-violet-600'
                  : 'text-slate-400 hover:bg-violet-50 hover:text-violet-600'
              }`}
              aria-label={`Descuento para ${item.productName} / Discount for ${item.productName}`}
              aria-expanded={showDiscount}
            >
              <Tag className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onRequestRemove(item)}
            disabled={!isEditable}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-25"
            aria-label={`Eliminar ${item.productName} / Remove ${item.productName}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditable && showDiscount && (
        <div className="mt-3 pl-4">
          <DiscountForm
            compact
            hasDiscount={hasDiscount}
            isLoading={isLoading}
            error={discountError}
            onApply={onApplyDiscount}
            onRemove={onRemoveDiscount}
          />
        </div>
      )}
    </li>
  )
}
