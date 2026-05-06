// ES: Página de inicio de sesión del cajero
// EN: Cashier login page

import { useState, type FormEvent } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from './useAuth'

export function LoginPage() {
  const [cashierId, setCashierId] = useState('')
  const [terminalId, setTerminalId] = useState(
    import.meta.env.VITE_TERMINAL_ID || 'TERM-001'
  )
  const [errors, setErrors] = useState<{ cashierId?: string; terminalId?: string }>({})
  const { handleLogin } = useAuth()

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!cashierId.trim()) newErrors.cashierId = 'ID de cajero requerido / Cashier ID required'
    if (!terminalId.trim()) newErrors.terminalId = 'ID de terminal requerido / Terminal ID required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      handleLogin(cashierId.trim(), terminalId.trim())
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <ShoppingCart className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Iniciar sesión / Sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="cashierId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              ID de Cajero / Cashier ID
            </label>
            <input
              id="cashierId"
              type="text"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cashierId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: CAJERO-01"
              aria-describedby={errors.cashierId ? 'cashierId-error' : undefined}
              aria-invalid={!!errors.cashierId}
            />
            {errors.cashierId && (
              <p id="cashierId-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.cashierId}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="terminalId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              ID de Terminal / Terminal ID
            </label>
            <input
              id="terminalId"
              type="text"
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.terminalId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: TERM-001"
              aria-describedby={errors.terminalId ? 'terminalId-error' : undefined}
              aria-invalid={!!errors.terminalId}
            />
            {errors.terminalId && (
              <p id="terminalId-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.terminalId}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Iniciar Sesión / Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
