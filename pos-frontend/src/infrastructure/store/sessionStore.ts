// ES: Store de sesión del cajero (Zustand)
// EN: Cashier session store (Zustand)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  cashierId: string | null
  terminalId: string | null
  isAuthenticated: boolean
  login: (cashierId: string, terminalId: string) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      cashierId: null,
      terminalId: null,
      isAuthenticated: false,
      login: (cashierId, terminalId) =>
        set({ cashierId, terminalId, isAuthenticated: true }),
      logout: () =>
        set({ cashierId: null, terminalId: null, isAuthenticated: false }),
    }),
    {
      name: 'pos-session',
    }
  )
)
