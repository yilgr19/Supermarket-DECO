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
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            Reintentar / Retry
          </button>
        )}
      </div>
    </div>
  )
}
