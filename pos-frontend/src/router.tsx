// ES: Configuración del router de la aplicación
// EN: Application router configuration

import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import SalePage from './features/sale/SalePage';
import FrozenSalesList from './features/sale/FrozenSalesList';
import ReceiptPage from './features/receipts/ReceiptPage';
import ReturnPage from './features/returns/ReturnPage';
import ProtectedRoute from './shared/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    // ES: Ruta pública de login / EN: Public login route
    path: '/login',
    element: <LoginPage />,
  },
  {
    // ES: Rutas protegidas / EN: Protected routes
    element: <ProtectedRoute />,
    children: [
      {
        // ES: Redirige raíz a /sale / EN: Redirects root to /sale
        path: '/',
        element: <Navigate to="/sale" replace />,
      },
      {
        path: '/sale',
        element: <SalePage />,
      },
      {
        path: '/sale/frozen',
        element: <FrozenSalesList />,
      },
      {
        path: '/receipt/:transactionId',
        element: <ReceiptPage />,
      },
      {
        path: '/sale/:saleId/return',
        element: <ReturnPage />,
      },
    ],
  },
  {
    // ES: Ruta catch-all / EN: Catch-all route
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
