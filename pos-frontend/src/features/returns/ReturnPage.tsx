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
import { PosPageHero } from '../../shared/components/PosPageHero'
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
      <div className="pos-page pos-page--medium">
        <div className="pos-card pos-card--danger">
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
    <div className="pos-page pos-page--medium">
      <PosPageHero
        tone="violet"
        eyebrow="Devolución"
        icon={<RotateCcw className="h-7 w-7" aria-hidden />}
        title={`Sale #${sale.id.slice(0, 10)}${sale.id.length > 10 ? '…' : ''}`}
      />

      <div className="pos-segmented">
        <button
          type="button"
          onClick={() => setMode('full')}
          className={`pos-segmented__btn ${mode === 'full' ? 'pos-segmented__btn--active' : ''}`}
          aria-pressed={mode === 'full'}
        >
          Total / Full
        </button>
        <button
          type="button"
          onClick={() => setMode('partial')}
          className={`pos-segmented__btn ${mode === 'partial' ? 'pos-segmented__btn--active' : ''}`}
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
