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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 50%, rgb(139 92 246 / 0.18), transparent 45%), radial-gradient(circle at 85% 30%, rgb(99 102 241 / 0.15), transparent 40%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="pos-card border-white/60 p-8 shadow-glow sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-indigo-500/30">
              <ShoppingCart className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Punto de venta · Iniciar sesión / Sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="cashierId"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                ID de cajero / Cashier ID
              </label>
              <input
                id="cashierId"
                type="text"
                value={cashierId}
                onChange={(e) => setCashierId(e.target.value)}
                className={`pos-input ${errors.cashierId ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Ej: CAJERO-01"
                aria-describedby={errors.cashierId ? 'cashierId-error' : undefined}
                aria-invalid={!!errors.cashierId}
              />
              {errors.cashierId && (
                <p id="cashierId-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.cashierId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="terminalId"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                ID de terminal / Terminal ID
              </label>
              <input
                id="terminalId"
                type="text"
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className={`pos-input ${errors.terminalId ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Ej: TERM-001"
                aria-describedby={errors.terminalId ? 'terminalId-error' : undefined}
                aria-invalid={!!errors.terminalId}
              />
              {errors.terminalId && (
                <p id="terminalId-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.terminalId}
                </p>
              )}
            </div>

            <button type="submit" className="pos-btn-primary mt-2 w-full">
              Iniciar sesión / Sign In
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Secure checkout session · Local demo
        </p>
      </div>
    </div>
  )
}
