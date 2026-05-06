// ES: Rutas protegidas — solo con sesión de cajero
// EN: Protected routes — require cashier session

import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSessionStore } from '../../infrastructure/store/sessionStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSessionStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
