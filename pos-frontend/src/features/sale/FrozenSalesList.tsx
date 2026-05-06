// ES: Lista de ventas congeladas por terminal
// EN: List of frozen sales by terminal

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Snowflake, Play, AlertTriangle } from 'lucide-react'
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter'
import { makeSaleUseCases } from '../../core/usecases/sale.usecases'
import { useSale } from './useSale'
import { useSessionStore } from '../../infrastructure/store/sessionStore'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Sale } from '../../core/types/sale.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

const saleUc = makeSaleUseCases(salesApiAdapter)

function sortFrozenByDateAsc(list: Sale[]): Sale[] {
  return [...list].sort((a, b) => {
    const ta = a.frozenAt ? new Date(a.frozenAt).getTime() : Number.POSITIVE_INFINITY
    const tb = b.frozenAt ? new Date(b.frozenAt).getTime() : Number.POSITIVE_INFINITY
    return ta - tb
  })
}

export function FrozenSalesList() {
  const navigate = useNavigate()
  const { terminalId } = useSessionStore()
  const { resumeSale, isLoading } = useSale()
  const [frozenSales, setFrozenSales] = useState<Sale[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!terminalId) return
    setFetchLoading(true)
    saleUc
      .listFrozen(terminalId)
      .then((rows) => setFrozenSales(sortFrozenByDateAsc(rows)))
      .catch((err) => setFetchError(getErrorMessage(err)))
      .finally(() => setFetchLoading(false))
  }, [terminalId])

  const handleResume = async (saleId: string) => {
    await resumeSale(saleId)
    navigate('/sale')
  }

  if (fetchLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-16">
        <LoadingSpinner label="Cargando ventas congeladas" />
      </div>
    )
  }
  if (fetchError) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="pos-card border-red-100/70">
          <ErrorMessage message={fetchError} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:p-10">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
          <Snowflake className="h-7 w-7 text-white" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ventas congeladas</h1>
          <p className="text-sm text-slate-500">Frozen holds · Terminal {terminalId}</p>
        </div>
      </div>

      {frozenSales.length === 0 ? (
        <div className="pos-card flex flex-col items-center border-dashed bg-slate-50/70 py-20 text-center">
          <Snowflake className="mb-5 h-12 w-12 text-slate-300" aria-hidden />
          <p className="font-medium text-slate-600">No hay ventas en espera</p>
          <p className="mt-1 text-sm text-slate-400">No frozen transactions</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {frozenSales.map((sale) => {
            const isExpired = sale.status === 'CANCELLED'
            return (
              <li
                key={sale.id}
                className={`pos-card overflow-hidden border-l-[4px] p-5 transition hover:shadow-pos-lg ${
                  isExpired
                    ? 'border-l-red-500 bg-gradient-to-br from-red-50/90 to-white'
                    : 'border-l-sky-400'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      Venta #{sale.id.slice(0, 12)}
                      {sale.id.length > 12 ? '…' : ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {sale.items.length} ítem ·{' '}
                      <span className="font-semibold text-indigo-600">
                        $
                        {sale.total.toLocaleString('es-CO')}
                      </span>
                    </p>
                    {sale.frozenAt && (
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(sale.frozenAt).toLocaleString('es-CO')}
                      </p>
                    )}
                    {isExpired && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Expirada / Expired
                      </div>
                    )}
                  </div>

                  {!isExpired && (
                    <button
                      type="button"
                      onClick={() => handleResume(sale.id)}
                      disabled={isLoading}
                      className="pos-btn-primary shrink-0 gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      Reanudar / Resume
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate('/sale')}
        className="pos-btn-secondary mt-8 w-full"
      >
        ← Volver a venta / Back to sale
      </button>
    </div>
  )
}
