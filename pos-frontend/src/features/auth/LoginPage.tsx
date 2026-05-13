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
    <div className="pos-login-shell">
      <div className="pos-login-shell__glow" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="pos-login-card">
          <div className="pos-login-brand">
            <div className="pos-login-brand__icon">
              <ShoppingCart className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="pos-login-brand__title">
              {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
            </h1>
            <p className="pos-login-brand__subtitle">
              Punto de venta · Iniciar sesión / Sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="cashierId" className="pos-field-label">
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
              <label htmlFor="terminalId" className="pos-field-label">
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
        <p className="pos-login-footnote">Secure checkout session · Local demo</p>
      </div>
    </div>
  )
}
