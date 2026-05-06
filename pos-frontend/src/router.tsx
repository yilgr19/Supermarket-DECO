// ES: Configuración de rutas de la aplicación
// EN: Application routing configuration

import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { SalePage } from './features/sale/SalePage'
import { FrozenSalesList } from './features/sale/FrozenSalesList'
import { ReceiptPage } from './features/receipts/ReceiptPage'
import { ReturnPage } from './features/returns/ReturnPage'
import { ProtectedRoute } from './shared/components/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/sale"
        element={
          <ProtectedRoute>
            <SalePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sale/frozen"
        element={
          <ProtectedRoute>
            <FrozenSalesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipt/:transactionId"
        element={
          <ProtectedRoute>
            <ReceiptPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sale/:saleId/return"
        element={
          <ProtectedRoute>
            <ReturnPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/sale" replace />} />
      <Route path="*" element={<Navigate to="/sale" replace />} />
    </Routes>
  )
}
