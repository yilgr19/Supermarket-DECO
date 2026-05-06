// ES: Store de sesión del cajero usando Zustand
// EN: Cashier session store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  cashierId: string | null;
  terminalId: string | null;
  isAuthenticated: boolean;
  login: (cashierId: string, terminalId: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      cashierId: null,
      terminalId: null,
      isAuthenticated: false,

      // ES: Inicia sesión guardando cashierId y terminalId
      // EN: Logs in by saving cashierId and terminalId
      login: (cashierId: string, terminalId: string) => {
        set({ cashierId, terminalId, isAuthenticated: true });
      },

      // ES: Cierra sesión limpiando el estado
      // EN: Logs out by clearing the state
      logout: () => {
        set({ cashierId: null, terminalId: null, isAuthenticated: false });
      },
    }),
    {
      name: 'pos-session',
    }
  )
);

// ES: Exportar getter para uso en axiosClient sin circular dependency
// EN: Export getter for use in axiosClient without circular dependency
export const getSessionState = () => useSessionStore.getState();
