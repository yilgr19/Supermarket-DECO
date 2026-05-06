// ES: Devolución parcial por líneas EN: Partial return lines

import type { SaleItem } from '../../core/types/sale.types'

export type PartialReturnLineState = {
  item: SaleItem
  returnQty: number
  reason: string
}

interface PartialReturnFormProps {
  lines: PartialReturnLineState[]
  onQuantityChange: (index: number, quantity: number) => void
  onReasonChange: (index: number, reason: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function PartialReturnForm({
  lines,
  onQuantityChange,
  onReasonChange,
  onSubmit,
  isLoading,
}: PartialReturnFormProps) {
  const hasAnyQty = lines.some((l) => l.returnQty > 0)

  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`

  return (
    <div className="flex flex-col gap-5">
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-inner">
        {lines.map((pi, idx) => (
          <li key={pi.item.id} className="p-4 hover:bg-orange-50/20">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{pi.item.productName}</p>
                <p className="text-xs text-slate-500">
                  Comprado {pi.item.quantity} · {fmt(pi.item.unitPrice)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${idx}`} className="text-xs font-medium text-slate-500">
                  Cantidad / Qty
                </label>
                <input
                  id={`qty-${idx}`}
                  type="number"
                  min={0}
                  max={pi.item.quantity}
                  value={pi.returnQty}
                  onChange={(e) => {
                    const val = Math.min(parseInt(e.target.value, 10) || 0, pi.item.quantity)
                    onQuantityChange(idx, val)
                  }}
                  className="w-[4rem] rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm tabular-nums focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
            </div>
            {pi.returnQty > 0 && (
              <input
                type="text"
                value={pi.reason}
                onChange={(e) => onReasonChange(idx, e.target.value)}
                placeholder="Motivo por ítem / Reason"
                className="pos-input text-sm"
                aria-label={`Motivo de devolución para ${pi.item.productName}`}
              />
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !hasAnyQty}
        className="min-h-[48px] rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-500 hover:to-red-500 disabled:pointer-events-none disabled:opacity-40"
      >
        {isLoading ? 'Procesando…' : 'Confirmar devolución parcial'}
      </button>
    </div>
  )
}
