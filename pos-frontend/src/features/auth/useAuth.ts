// ES: Hook de autenticación del cajero / EN: Cashier authentication hook

import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../infrastructure/store/sessionStore'
import { useSaleStore } from '../../infrastructure/store/saleStore'

export function useAuth() {
  const navigate = useNavigate()
  const { cashierId, terminalId, isAuthenticated, login, logout } = useSessionStore()
  const { clearSale } = useSaleStore()

  const handleLogin = (cashierId: string, terminalId: string) => {
    login(cashierId, terminalId)
    navigate('/sale')
  }

  const handleLogout = () => {
    clearSale()
    logout()
    navigate('/login')
  }

  return { cashierId, terminalId, isAuthenticated, handleLogin, handleLogout }
}
