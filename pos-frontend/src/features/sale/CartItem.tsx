// ES: Componente de línea de venta en el carrito
// EN: Sale line item component in the cart

import { Trash2 } from 'lucide-react'
import type { SaleItem } from '../../core/types/sale.types'

interface CartItemProps {
  item: SaleItem
  isEditable: boolean
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRequestRemove: (item: SaleItem) => void
}

export function CartItemRow({
  item,
  isEditable,
  onUpdateQuantity,
  onRequestRemove,
}: CartItemProps) {
  return (
    <li className="flex items-center gap-3 py-3.5 transition first:pt-2">
      <div className="min-w-0 flex-1 border-l-[3px] border-violet-400 pl-3">
        <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
        <p className="text-xs text-slate-500">${item.unitPrice.toLocaleString('es-CO')} · unidad</p>
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

        <p className="w-[5.75rem] text-right text-sm font-bold tabular-nums text-slate-900">
          ${item.lineTotal.toLocaleString('es-CO')}
        </p>

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
    </li>
  )
}
