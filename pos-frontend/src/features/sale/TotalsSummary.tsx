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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
          <div className="flex justify-between rounded-lg bg-slate-50 px-2 py-1 text-slate-700">
            <dt className="font-medium">Descuento / Discount</dt>
            <dd className="font-bold tabular-nums">−{fmt(sale.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold tracking-tight text-slate-900">
          <dt>TOTAL</dt>
          <dd className="tabular-nums">{fmt(sale.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
