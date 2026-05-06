// ES: Resumen de totales de la venta
// EN: Sale totals summary

import type { Sale } from '../../core/types/sale.types'

interface TotalsSummaryProps {
  sale: Sale | null
}

const fmt = (n: number) => `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`

export function TotalsSummary({ sale }: TotalsSummaryProps) {
  if (!sale) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-pos">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500" />
      <dl className="space-y-2 p-5 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>Subtotal</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{fmt(sale.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>Impuesto / Tax</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{fmt(sale.tax)}</dd>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between rounded-lg bg-emerald-50/80 px-2 py-1 text-emerald-800">
            <dt className="font-medium">Descuento / Discount</dt>
            <dd className="font-bold tabular-nums">−{fmt(sale.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold tracking-tight text-slate-900">
          <dt>TOTAL</dt>
          <dd className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text tabular-nums text-transparent">
            {fmt(sale.total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
