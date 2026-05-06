// ES: Página de devoluciones (total y parcial)
// EN: Returns page (full and partial)

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter'
import { makeSaleUseCases } from '../../core/usecases/sale.usecases'
import { useReturn } from './useReturn'
import { FullReturnForm } from './FullReturnForm'
import {
  PartialReturnForm,
  type PartialReturnLineState,
} from './PartialReturnForm'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Sale, ReturnItemRequest } from '../../core/types/sale.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

const saleUc = makeSaleUseCases(salesApiAdapter)

type ReturnMode = 'full' | 'partial'

export function ReturnPage() {
  const { saleId } = useParams<{ saleId: string }>()
  const navigate = useNavigate()
  const { isLoading, error, fullReturn, partialReturn } = useReturn()

  const [sale, setSale] = useState<Sale | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [mode, setMode] = useState<ReturnMode>('full')
  const [fullReason, setFullReason] = useState('')
  const [partialItems, setPartialItems] = useState<PartialReturnLineState[]>([])

  useEffect(() => {
    if (!saleId) return
    saleUc
      .getSale(saleId)
      .then((s) => {
        setSale(s)
        setPartialItems(s.items.map((item) => ({ item, returnQty: 0, reason: '' })))
      })
      .catch((err) => setFetchError(getErrorMessage(err)))
  }, [saleId])

  const handleFullReturn = async () => {
    if (!saleId || !fullReason.trim()) return
    const receipt = await fullReturn(saleId, fullReason.trim())
    if (receipt) navigate(`/receipt/${receipt.transactionId}`)
  }

  const handlePartialReturn = async () => {
    if (!saleId) return
    const items: ReturnItemRequest[] = partialItems
      .filter((pi) => pi.returnQty > 0)
      .map((pi) => ({
        saleItemId: pi.item.id,
        quantity: pi.returnQty,
        reason: pi.reason,
      }))
    if (items.length === 0) return
    const receipt = await partialReturn(saleId, items)
    if (receipt) navigate(`/receipt/${receipt.transactionId}`)
  }

  const onPartialQtyChange = (index: number, returnQty: number) => {
    setPartialItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, returnQty } : p))
    )
  }

  const onPartialReasonChange = (index: number, reason: string) => {
    setPartialItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, reason } : p))
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
  if (!sale) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center py-16">
        <LoadingSpinner label="Cargando venta" />
      </div>
    )
  }

  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:p-10">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-500/25">
          <RotateCcw className="h-7 w-7 text-white" aria-hidden />
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-orange-600">
            Devolución
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sale #{sale.id.slice(0, 10)}
            {sale.id.length > 10 ? '…' : ''}
          </h1>
        </div>
      </div>

      <div className="mb-8 flex rounded-2xl border border-slate-200 bg-slate-100/70 p-1">
        <button
          type="button"
          onClick={() => setMode('full')}
          className={`flex flex-1 items-center justify-center rounded-xl py-3.5 text-sm font-semibold transition ${
            mode === 'full'
              ? 'bg-white text-orange-700 shadow-md shadow-slate-200/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={mode === 'full'}
        >
          Total / Full
        </button>
        <button
          type="button"
          onClick={() => setMode('partial')}
          className={`flex flex-1 items-center justify-center rounded-xl py-3.5 text-sm font-semibold transition ${
            mode === 'partial'
              ? 'bg-white text-orange-700 shadow-md shadow-slate-200/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={mode === 'partial'}
        >
          Parcial / Partial
        </button>
      </div>

      {mode === 'full' && (
        <FullReturnForm
          itemCount={sale.items.length}
          totalFormatted={fmt(sale.total)}
          reason={fullReason}
          onReasonChange={setFullReason}
          onSubmit={handleFullReturn}
          isLoading={isLoading}
        />
      )}

      {mode === 'partial' && (
        <PartialReturnForm
          lines={partialItems}
          onQuantityChange={onPartialQtyChange}
          onReasonChange={onPartialReasonChange}
          onSubmit={handlePartialReturn}
          isLoading={isLoading}
        />
      )}

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error.message ?? ''} />
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="pos-btn-secondary mt-8 w-full"
      >
        ← Volver / Back
      </button>
    </div>
  )
}
