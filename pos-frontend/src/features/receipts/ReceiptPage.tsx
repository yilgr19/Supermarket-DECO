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
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
        <div className="pos-card border-red-100/80">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100/80 via-slate-50 to-white py-10">
      <div className="mx-auto max-w-md px-4">
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
              className="pos-btn-secondary w-full gap-2 border-orange-200 bg-orange-50/90 text-orange-900 hover:bg-orange-100"
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
