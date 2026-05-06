// ES: Componente reutilizable para mensajes de error
// EN: Reusable error message component

import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-white p-4 text-red-900 shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-red-700 underline decoration-red-300 underline-offset-2 transition hover:text-red-800 hover:decoration-red-500"
          >
            Reintentar / Retry
          </button>
        )}
      </div>
    </div>
  )
}
