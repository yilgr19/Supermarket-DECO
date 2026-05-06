// ES: Componente de ruta protegida — redirige al login si no hay sesión
// EN: Protected route component — redirects to login if no session

import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '../../infrastructure/store/sessionStore';

export default function ProtectedRoute() {
  const { isAuthenticated } = useSessionStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
