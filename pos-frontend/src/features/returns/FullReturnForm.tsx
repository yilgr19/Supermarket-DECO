// ES: Devolución total EN: Full return form segment

interface FullReturnFormProps {
  itemCount: number
  totalFormatted: string
  reason: string
  onReasonChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function FullReturnForm({
  itemCount,
  totalFormatted,
  reason,
  onReasonChange,
  onSubmit,
  isLoading,
}: FullReturnFormProps) {
  const canSubmit = reason.trim().length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="pos-card border-orange-100/80 bg-gradient-to-br from-orange-50/70 to-white">
        <p className="text-sm leading-relaxed text-slate-600">
          Se devolverán todos los ítems ({itemCount}) por un total de{' '}
          <span className="font-bold text-orange-900">{totalFormatted}</span>.
        </p>
      </div>
      <div>
        <label
          htmlFor="full-reason"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Motivo / Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          id="full-reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={4}
          className="pos-input resize-none"
          placeholder="Motivo de la devolución..."
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !canSubmit}
        className="min-h-[48px] rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-500 hover:to-red-500 disabled:pointer-events-none disabled:opacity-40"
      >
        {isLoading ? 'Procesando…' : 'Confirmar devolución total'}
      </button>
    </div>
  )
}
