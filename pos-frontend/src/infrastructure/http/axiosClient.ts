// ES: Cliente HTTP con interceptores para manejo de errores y autenticación
// EN: HTTP client with interceptors for error handling and authentication

import axios from 'axios';

// ES: Clase de error tipado para errores de la API
// EN: Typed error class for API errors
export interface OutOfStockItem {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public outOfStockItems?: OutOfStockItem[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ES: Función para obtener el estado de sesión sin importar el store directamente
// EN: Function to get session state without directly importing the store
let getCashierId: () => string | null = () => null;

export function setCashierIdGetter(getter: () => string | null) {
  getCashierId = getter;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SALES_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ES: Interceptor de request: agrega X-Cashier-Id desde sessionStore
// EN: Request interceptor: adds X-Cashier-Id from sessionStore
axiosInstance.interceptors.request.use((config) => {
  const cashierId = getCashierId();
  if (cashierId) {
    config.headers['X-Cashier-Id'] = cashierId;
  }
  return config;
});

// ES: Interceptor de response: mapea errores HTTP a ApiError tipado
// EN: Response interceptor: maps HTTP errors to typed ApiError
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // ES: Error de red / EN: Network error
      throw new ApiError(0, 'Sin conexión, verifique su red / No connection, check your network');
    }

    const status = error.response?.status as number;
    const data = error.response?.data as { message?: string; outOfStockItems?: OutOfStockItem[] };

    let message = data?.message || 'Error desconocido / Unknown error';

    // ES: Mapeo de códigos HTTP a mensajes operativos
    // EN: HTTP code mapping to operational messages
    switch (status) {
      case 503:
        message = data?.message || 'Servicio no disponible, intente de nuevo / Service unavailable, please try again';
        break;
      case 404:
        message = data?.message || 'Recurso no encontrado / Resource not found';
        break;
      case 409:
        message = data?.message || 'Stock insuficiente / Insufficient stock';
        break;
      case 422:
        message = data?.message || 'Error de validación / Validation error';
        break;
    }

    throw new ApiError(status, message, data?.outOfStockItems);
  }
);

export default axiosInstance;
