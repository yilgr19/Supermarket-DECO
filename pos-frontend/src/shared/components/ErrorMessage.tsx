// ES: Componente reutilizable para mostrar mensajes de error
// EN: Reusable component for displaying error messages

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      {/* ES: Icono de error / EN: Error icon */}
      <span className="text-red-500 text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
      <div className="flex-1">
        <p className="text-red-700 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 min-h-[44px] px-2"
            aria-label="Reintentar / Retry"
          >
            Reintentar / Retry
          </button>
        )}
      </div>
    </div>
  );
}
