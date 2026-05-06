// ES: Diálogo de cancelación de venta con campo de motivo
// EN: Sale cancellation dialog with reason field

import { useState } from 'react'
import { X } from 'lucide-react'

const MAX_REASON_LENGTH = 255

interface CancelDialogProps {
  isOpen: boolean
  isLoading: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function CancelDialog({ isOpen, isLoading, onConfirm, onCancel }: CancelDialogProps) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  if (!isOpen) return null

  const isValid = reason.trim().length > 0 && reason.length <= MAX_REASON_LENGTH

  const handleConfirm = () => {
    setTouched(true)
    if (isValid) {
      onConfirm(reason.trim())
      setReason('')
      setTouched(false)
    }
  }

  const handleCancel = () => {
    setReason('')
    setTouched(false)
    onCancel()
  }

  return (
    <div className="pos-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title">
      <div className="pos-modal-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-xl bg-red-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-red-700 ring-1 ring-red-100">
              Acción irreversible / Irreversible
            </div>
            <h2 id="cancel-dialog-title" className="text-lg font-bold tracking-tight text-slate-900">
              Cancelar venta / Cancel Sale
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar / Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Esta acción no se puede deshacer. / This cannot be undone.
        </p>

        <div className="mt-5">
          <label
            htmlFor="cancel-reason"
            className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={MAX_REASON_LENGTH}
            className={`pos-input resize-none ${
              touched && !isValid ? 'border-red-300 ring-4 ring-red-100' : ''
            }`}
            placeholder="Motivo... / Reason..."
            aria-describedby="cancel-reason-count"
            aria-invalid={touched && !isValid}
          />
          <p
            id="cancel-reason-count"
            className={`mt-1.5 text-right text-xs ${
              reason.length > MAX_REASON_LENGTH - 24 ? 'font-medium text-amber-600' : 'text-slate-400'
            }`}
          >
            {reason.length}/{MAX_REASON_LENGTH}
          </p>
          {touched && !reason.trim() && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              El motivo es requerido / Reason required
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="pos-btn-secondary min-w-[100px]"
          >
            Volver / Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-h-[44px] rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Cancelando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
