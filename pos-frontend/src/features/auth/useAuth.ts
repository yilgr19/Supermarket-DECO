// ES: Hook de autenticación — expone estado de sesión y función logout
// EN: Authentication hook — exposes session state and logout function

import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../infrastructure/store/sessionStore';
import { useSaleStore } from '../../infrastructure/store/saleStore';

export function useAuth() {
  const { cashierId, terminalId, isAuthenticated, logout } = useSessionStore();
  const { clearSale } = useSaleStore();
  const navigate = useNavigate();

  // ES: Cierra sesión, limpia el estado y redirige al login
  // EN: Logs out, clears state, and redirects to login
  const handleLogout = () => {
    clearSale();
    logout();
    navigate('/login');
  };

  return {
    cashierId,
    terminalId,
    isAuthenticated,
    logout: handleLogout,
  };
}
