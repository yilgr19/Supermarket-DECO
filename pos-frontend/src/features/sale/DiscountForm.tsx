// ES: Formulario para aplicar descuentos a la venta
// EN: Form to apply discounts to the sale

import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { DiscountType } from '../../core/types/sale.types'

interface DiscountFormProps {
  hasDiscount: boolean
  isLoading: boolean
  error: string | null
  onApply: (type: DiscountType, value: number) => void
  onRemove: () => void
}

export function DiscountForm({
  hasDiscount,
  isLoading,
  error,
  onApply,
  onRemove,
}: DiscountFormProps) {
  const [type, setType] = useState<DiscountType>('PERCENTAGE')
  const [value, setValue] = useState('')

  const handleApply = () => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      onApply(type, num)
      setValue('')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-inner shadow-slate-100/80">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
          <Tag className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-slate-800">Descuento / Discount</span>
      </div>

      {hasDiscount ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={isLoading}
          className="pos-btn-secondary w-full justify-center gap-2 border-red-100 text-red-700 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Remover descuento / Remove
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('PERCENTAGE')}
              className={`flex-1 rounded-xl py-3 text-xs font-semibold uppercase tracking-wide transition ${
                type === 'PERCENTAGE'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              aria-pressed={type === 'PERCENTAGE'}
            >
              % Porcentaje
            </button>
            <button
              type="button"
              onClick={() => setType('FIXED_AMOUNT')}
              className={`flex-1 rounded-xl py-3 text-xs font-semibold uppercase tracking-wide transition ${
                type === 'FIXED_AMOUNT'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              aria-pressed={type === 'FIXED_AMOUNT'}
            >
              $ Fijo / Fixed
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={0.01}
              step={type === 'PERCENTAGE' ? 1 : 100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'PERCENTAGE' ? 'Ej: 10' : 'Ej: 5000'}
              className="pos-input min-h-[46px] flex-1 bg-slate-50/80 tabular-nums focus:bg-white"
              aria-label={
                type === 'PERCENTAGE'
                  ? 'Valor del descuento en porcentaje'
                  : 'Valor del descuento en monto fijo'
              }
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={isLoading || !value || parseFloat(value) <= 0}
              className="min-h-[46px] rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}
    </div>
  )
}
