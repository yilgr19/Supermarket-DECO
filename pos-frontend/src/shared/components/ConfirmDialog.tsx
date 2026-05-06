// ES: Diálogo de confirmación reutilizable / EN: Reusable confirmation dialog

import { X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar / Confirm',
  cancelLabel = 'Cancelar / Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar / Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-[44px] rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
