// ES: Página de recibo tras checkout exitoso
// EN: Receipt page after successful checkout

import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ShoppingCart, RotateCcw } from 'lucide-react'
import { useReceipt } from './useReceipt'
import { ReceiptView } from './ReceiptView'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'

export function ReceiptPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const { receipt, isLoading, error } = useReceipt(transactionId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner label="Cargando recibo..." size="lg" />
        <p className="text-sm text-slate-500">Preparando ticket…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pos-page pos-page--narrow flex min-h-screen flex-col justify-center">
        <div className="pos-card pos-card--danger">
          <ErrorMessage message={error} />
        </div>
        <button
          type="button"
          onClick={() => navigate('/sale')}
          className="pos-btn-primary mt-6 w-full"
        >
          Nueva venta / New Sale
        </button>
      </div>
    )
  }

  if (!receipt) return null

  return (
    <div className="pos-receipt-shell">
      <div className="pos-page pos-page--narrow">
        <ReceiptView receipt={receipt} />

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="pos-btn-secondary w-full gap-2"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Imprimir / Print
          </button>

          {receipt.receiptType === 'SALE' && (
            <button
              type="button"
              onClick={() => navigate(`/sale/${receipt.saleId}/return`)}
              className="pos-btn-secondary w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Devolución / Return
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/sale')}
            className="pos-btn-primary w-full gap-2"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Nueva venta / New Sale
          </button>
        </div>
      </div>
    </div>
  )
}
