// ES: Componente raíz de la aplicación
// EN: Application root component

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { useSessionStore } from './infrastructure/store/sessionStore';
import { setCashierIdGetter } from './infrastructure/http/axiosClient';

function App() {
  // ES: Conecta el getter de cashierId al cliente HTTP para evitar dependencia circular
  // EN: Connects the cashierId getter to the HTTP client to avoid circular dependency
  useEffect(() => {
    setCashierIdGetter(() => useSessionStore.getState().cashierId);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
