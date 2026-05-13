// ES: Modal de checkout con opciones de pago efectivo y crédito
// EN: Checkout modal with cash and credit payment options

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CreditCard, Banknote } from 'lucide-react'
import { useCheckout } from './useCheckout'
import { CashPaymentForm } from './CashPaymentForm'
import { CreditPaymentForm } from './CreditPaymentForm'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import type { Customer } from '../../core/types/customer.types'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCustomer: Customer | null
}

type PaymentTab = 'CASH' | 'CREDIT'

export function CheckoutModal({ isOpen, onClose, selectedCustomer }: CheckoutModalProps) {
  const navigate = useNavigate()
  const { activeSale, isLoading, error, clearError, checkoutCash, checkoutCredit } =
    useCheckout()
  const [tab, setTab] = useState<PaymentTab>('CASH')
  const [amountReceived, setAmountReceived] = useState('')

  if (!isOpen || !activeSale) return null

  const total = activeSale.total
  const received = parseFloat(amountReceived) || 0
  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`

  const handleCash = async () => {
    const receipt = await checkoutCash(received)
    if (receipt) {
      navigate(`/receipt/${receipt.transactionId}`)
    }
  }

  const handleCredit = async () => {
    const receipt = await checkoutCredit()
    if (receipt) {
      navigate(`/receipt/${receipt.transactionId}`)
    }
  }

  const creditBlocked = !selectedCustomer || selectedCustomer.creditStatus !== 'APPROVED'
  const outOfStockItems = error?.outOfStockItems

  return (
    <div className="pos-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="pos-modal-panel max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pos-modal-eyebrow">
              Checkout
            </p>
            <h2 id="checkout-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {fmt(total)}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              clearError()
              onClose()
            }}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
            aria-label="Cerrar / Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex rounded-2xl border border-slate-200 bg-slate-100/70 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('CASH')
              clearError()
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              tab === 'CASH'
                ? 'bg-white text-indigo-700 shadow-md shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-pressed={tab === 'CASH'}
          >
            <Banknote className="h-4 w-4" />
            Efectivo
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('CREDIT')
              clearError()
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              tab === 'CREDIT'
                ? 'bg-white text-indigo-700 shadow-md shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-pressed={tab === 'CREDIT'}
          >
            <CreditCard className="h-4 w-4" />
            Crédito
          </button>
        </div>

        <div className="mt-6">
          {tab === 'CASH' && (
            <CashPaymentForm
              total={total}
              amountReceived={amountReceived}
              onAmountReceivedChange={setAmountReceived}
              fmt={fmt}
            />
          )}

          {tab === 'CREDIT' && <CreditPaymentForm selectedCustomer={selectedCustomer} />}
        </div>

        {error && (
          <div className="mt-4">
            {outOfStockItems && outOfStockItems.length > 0 ? (
              <div className="pos-alert">
                <p className="mb-2 text-sm font-semibold">Stock insuficiente</p>
                <ul className="space-y-1">
                  {outOfStockItems.map((item) => (
                    <li key={item.productId} className="text-xs">
                      {item.productName}: disponible {item.available}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ErrorMessage message={error.message ?? ''} onRetry={clearError} />
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => {
              clearError()
              onClose()
            }}
            disabled={isLoading}
            className="pos-btn-secondary flex-1"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={tab === 'CASH' ? handleCash : handleCredit}
            disabled={
              isLoading ||
              (tab === 'CASH' && received < total) ||
              (tab === 'CREDIT' && creditBlocked)
            }
            className="pos-btn-primary min-h-[46px] flex-1 px-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" /> Procesando
              </span>
            ) : (
              'Pagar / Pay'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
