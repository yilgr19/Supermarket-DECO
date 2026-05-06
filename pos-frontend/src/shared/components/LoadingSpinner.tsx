// ES: Spinner de carga accesible / EN: Accessible loading spinner

interface LoadingSpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function LoadingSpinner({
  label = 'Cargando... / Loading...',
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
