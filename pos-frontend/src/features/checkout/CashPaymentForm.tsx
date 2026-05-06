// ES: Entrada de pago efectivo en checkout EN: Cash payment amount in checkout

interface CashPaymentFormProps {
  total: number
  amountReceived: string
  onAmountReceivedChange: (value: string) => void
  fmt?: (n: number) => string
}

export function CashPaymentForm({
  total,
  amountReceived,
  onAmountReceivedChange,
  fmt = (n) => `$${n.toLocaleString('es-CO')}`,
}: CashPaymentFormProps) {
  const received = parseFloat(amountReceived) || 0
  const change = Math.max(0, received - total)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="amount-received"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Monto recibido / Amount received
        </label>
        <input
          id="amount-received"
          type="number"
          min={total}
          step={100}
          value={amountReceived}
          onChange={(e) => onAmountReceivedChange(e.target.value)}
          className="pos-input text-lg font-semibold tabular-nums"
          placeholder={`Mínimo ${fmt(total)}`}
          aria-describedby="change-display"
        />
      </div>
      {received > 0 && (
        <div
          id="change-display"
          role="status"
          className={`rounded-2xl p-5 text-center ${
            received >= total
              ? 'border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-inner'
              : 'border border-red-200 bg-gradient-to-br from-red-50 to-white'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vuelto / Change
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{fmt(change)}</p>
        </div>
      )}
    </div>
  )
}
