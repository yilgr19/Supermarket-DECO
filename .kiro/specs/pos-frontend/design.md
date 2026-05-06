# Documento de Diseño / Design Document
## POS Frontend — Supermarket Point of Sale

---

## 1. Visión General / Overview

**ES:** Aplicación web SPA construida con React 18 + TypeScript + Vite. Arquitectura hexagonal (ports & adapters): el núcleo de casos de uso no depende de HTTP ni de React; los adaptadores HTTP implementan los puertos; los componentes React consumen los casos de uso vía hooks. El servidor (Sales API) es la fuente de verdad para totales, stock y estados.

**EN:** SPA web application built with React 18 + TypeScript + Vite. Hexagonal (ports & adapters) architecture: the use-case core does not depend on HTTP or React; HTTP adapters implement the ports; React components consume use cases via hooks. The server (Sales API) is the source of truth for totals, stock, and states.

---

## 2. Stack Técnico / Tech Stack

| Componente / Component | Tecnología / Technology |
|---|---|
| Lenguaje / Language | TypeScript 5+ |
| Framework UI | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Estado global / Global state | Zustand (sesión y venta activa) |
| HTTP client | Axios con interceptores / with interceptors |
| Estilos / Styles | Tailwind CSS |
| Componentes UI | shadcn/ui (Radix UI + Tailwind) |
| Escaneo de barcode / Barcode scanning | @zxing/browser |
| Pruebas unitarias / Unit tests | Vitest + React Testing Library |
| Pruebas E2E | Playwright |
| Mock HTTP en tests | MSW (Mock Service Worker) |
| Cobertura / Coverage | Vitest coverage (≥70% módulos core) |
| Linting | ESLint + Prettier |
| Node.js | 18+ |

---

## 3. Arquitectura / Architecture

### 3.1 Estructura de Carpetas / Folder Structure

```
src/
├── core/                          # Dominio puro / Pure domain
│   ├── types/                     # Tipos e interfaces / Types and interfaces
│   │   ├── sale.types.ts
│   │   ├── product.types.ts
│   │   ├── customer.types.ts
│   │   └── receipt.types.ts
│   ├── ports/                     # Interfaces de puertos / Port interfaces
│   │   ├── SalePort.ts
│   │   ├── ProductPort.ts
│   │   └── CustomerPort.ts
│   └── usecases/                  # Casos de uso / Use cases
│       ├── sale.usecases.ts
│       ├── checkout.usecases.ts
│       └── return.usecases.ts
├── adapters/
│   └── http/                      # Implementaciones HTTP / HTTP implementations
│       ├── salesApiAdapter.ts
│       ├── productApiAdapter.ts
│       └── customerApiAdapter.ts
├── infrastructure/
│   ├── http/
│   │   └── axiosClient.ts         # Axios + interceptores / Axios + interceptors
│   └── store/
│       ├── sessionStore.ts        # Zustand: cashier, terminal
│       └── saleStore.ts           # Zustand: venta activa / active sale
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── useAuth.ts
│   ├── products/
│   │   ├── ProductSearch.tsx
│   │   ├── BarcodeScanner.tsx
│   │   └── useProductSearch.ts
│   ├── sale/
│   │   ├── SalePage.tsx
│   │   ├── CartPanel.tsx
│   │   ├── CartItem.tsx
│   │   ├── TotalsSummary.tsx
│   │   ├── DiscountForm.tsx
│   │   ├── FrozenSalesList.tsx
│   │   └── useSale.ts
│   ├── checkout/
│   │   ├── CheckoutModal.tsx
│   │   ├── CashPaymentForm.tsx
│   │   ├── CreditPaymentForm.tsx
│   │   └── useCheckout.ts
│   ├── receipts/
│   │   ├── ReceiptPage.tsx
│   │   ├── ReceiptView.tsx
│   │   └── useReceipt.ts
│   └── returns/
│       ├── ReturnPage.tsx
│       ├── FullReturnForm.tsx
│       ├── PartialReturnForm.tsx
│       └── useReturn.ts
├── shared/
│   ├── components/
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── StatusBadge.tsx
│   └── hooks/
│       └── useApiError.ts
├── App.tsx
├── main.tsx
└── router.tsx
```

### 3.2 Diagrama de Capas / Layer Diagram

```
┌─────────────────────────────────────────────┐
│           React Components / Pages           │
│  (features/: auth, products, sale, checkout) │
├─────────────────────────────────────────────┤
│         Custom Hooks (useXxx.ts)             │
│   Orquestan casos de uso / Orchestrate UCs   │
├─────────────────────────────────────────────┤
│         Use Cases (core/usecases/)           │
│   Lógica de negocio pura / Pure biz logic    │
├─────────────────────────────────────────────┤
│         Ports (core/ports/)                  │
│   Interfaces de contrato / Contract ifaces   │
├─────────────────────────────────────────────┤
│         HTTP Adapters (adapters/http/)        │
│   Implementan puertos / Implement ports      │
├─────────────────────────────────────────────┤
│         Axios Client + Interceptors          │
│   X-Cashier-Id header, error mapping         │
└─────────────────────────────────────────────┘
```

---

## 4. Tipos Principales / Main Types

```typescript
// sale.types.ts
export type SaleStatus =
  | 'ACTIVE' | 'FROZEN' | 'COMPLETED'
  | 'CANCELLED' | 'RETURNED' | 'PARTIALLY_RETURNED';

export type PaymentType = 'CASH' | 'CREDIT';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Sale {
  id: string;
  terminalId: string;
  cashierId: string;
  customerId?: string;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

// product.types.ts
export interface Product {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
  availableStock: number;
  category: string;
}

// customer.types.ts
export type CreditStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface Customer {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  creditStatus: CreditStatus;
}

// receipt.types.ts
export interface Receipt {
  transactionId: string;
  saleId: string;
  receiptType: 'SALE' | 'FULL_RETURN' | 'PARTIAL_RETURN';
  storeName: string;
  terminalId: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  paymentType: PaymentType;
  amountReceived?: number;
  changeAmount?: number;
  creditReference?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  originalTransactionId?: string;
  createdAt: string;
}
```

---

## 5. Puertos / Ports

```typescript
// SalePort.ts
export interface SalePort {
  createSale(terminalId: string, customerId?: string): Promise<Sale>;
  getSale(saleId: string): Promise<Sale>;
  addItem(saleId: string, productId?: string, barcode?: string, quantity: number): Promise<Sale>;
  updateItem(saleId: string, itemId: string, quantity: number): Promise<Sale>;
  removeItem(saleId: string, itemId: string): Promise<Sale>;
  applyDiscount(saleId: string, type: DiscountType, value: number): Promise<Sale>;
  freeze(saleId: string): Promise<Sale>;
  resume(saleId: string): Promise<Sale>;
  cancel(saleId: string, reason: string): Promise<Sale>;
  listFrozen(terminalId: string): Promise<Sale[]>;
  checkout(saleId: string, paymentType: PaymentType, amountReceived?: number): Promise<Receipt>;
  fullReturn(saleId: string, reason: string): Promise<Receipt>;
  partialReturn(saleId: string, items: ReturnItemRequest[]): Promise<Receipt>;
}

// ProductPort.ts
export interface ProductPort {
  searchByName(name: string): Promise<Product[]>;
  searchByBarcode(barcode: string): Promise<Product>;
}

// CustomerPort.ts
export interface CustomerPort {
  searchByName(name: string): Promise<Customer[]>;
  searchByDocument(documentNumber: string): Promise<Customer>;
}
```

---

## 6. Cliente HTTP y Manejo de Errores / HTTP Client and Error Handling

```typescript
// axiosClient.ts
// ES: Interceptor de request: agrega X-Cashier-Id desde sessionStore
// EN: Request interceptor: adds X-Cashier-Id from sessionStore
axiosInstance.interceptors.request.use((config) => {
  const { cashierId } = sessionStore.getState();
  if (cashierId) config.headers['X-Cashier-Id'] = cashierId;
  return config;
});

// ES: Interceptor de response: mapea errores HTTP a ApiError tipado
// EN: Response interceptor: maps HTTP errors to typed ApiError
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    throw new ApiError(status, data?.message, data?.outOfStockItems);
  }
);

// ApiError
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public outOfStockItems?: OutOfStockItem[]
  ) { super(message); }
}
```

### Mapeo de Errores / Error Mapping

| HTTP Status | Mensaje UI ES | UI Message EN |
|---|---|---|
| 503 | Servicio no disponible, intente de nuevo | Service unavailable, please try again |
| 409 | Stock insuficiente: [lista de productos] | Insufficient stock: [product list] |
| 422 | [mensaje específico del backend] | [specific backend message] |
| 404 | Recurso no encontrado | Resource not found |
| Network error | Sin conexión, verifique su red | No connection, check your network |

---

## 7. Estado Global / Global State

```typescript
// sessionStore.ts (Zustand)
interface SessionState {
  cashierId: string | null;
  terminalId: string | null;
  isAuthenticated: boolean;
  login: (cashierId: string, terminalId: string) => void;
  logout: () => void;
}

// saleStore.ts (Zustand)
interface SaleState {
  activeSale: Sale | null;
  setActiveSale: (sale: Sale | null) => void;
  clearSale: () => void;
}
```

---

## 8. Rutas / Routes

| Path | Componente / Component | Protegida / Protected |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/` | `SalePage` (redirect) | Sí / Yes |
| `/sale` | `SalePage` | Sí / Yes |
| `/sale/frozen` | `FrozenSalesList` | Sí / Yes |
| `/receipt/:transactionId` | `ReceiptPage` | Sí / Yes |
| `/sale/:saleId/return` | `ReturnPage` | Sí / Yes |

---

## 9. Pantallas Principales / Main Screens

### 9.1 Pantalla de Venta / Sale Screen (SalePage)

```
┌─────────────────────────────────────────────────────┐
│  [Logo] POS Terminal: TERM-001  Cajero: Juan  [Logout]│
├──────────────────────┬──────────────────────────────┤
│  BÚSQUEDA            │  CARRITO                     │
│  [🔍 Buscar nombre]  │  Producto    Cant  Precio    │
│  [📷 Escanear]       │  Leche 1L    2     $2.400    │
│  [Resultados...]     │  Pan         1     $1.200    │
│                      │  ─────────────────────────── │
│  CLIENTE             │  Subtotal:        $5.600     │
│  [🔍 Buscar cliente] │  Impuesto (19%):  $1.064     │
│  [Cliente: N/A]      │  Descuento:       $0         │
│                      │  TOTAL:           $6.664     │
│                      │                              │
│                      │  [% Descuento] [$ Descuento] │
│                      │  [❄ Congelar] [✕ Cancelar]  │
│                      │  [💳 CHECKOUT]               │
└──────────────────────┴──────────────────────────────┘
```

### 9.2 Modal de Checkout / Checkout Modal

```
┌─────────────────────────────────┐
│  CHECKOUT — Total: $6.664       │
│  ○ Efectivo  ○ Crédito          │
│                                 │
│  [Efectivo seleccionado]        │
│  Monto recibido: [$______]      │
│  Vuelto: $0                     │
│                                 │
│  [Cancelar]  [✓ Confirmar Pago] │
└─────────────────────────────────┘
```

### 9.3 Pantalla de Recibo / Receipt Screen

```
┌─────────────────────────────────┐
│  SUPERMERCADO POS               │
│  Terminal: TERM-001             │
│  Cajero: Juan                   │
│  Fecha: 05/05/2026 10:30        │
│  ─────────────────────────────  │
│  Leche 1L    x2    $4.800       │
│  Pan         x1    $1.200       │
│  ─────────────────────────────  │
│  Subtotal:         $6.000       │
│  Impuesto:         $1.140       │
│  Descuento:        $0           │
│  TOTAL:            $7.140       │
│  ─────────────────────────────  │
│  Pago: EFECTIVO                 │
│  Recibido: $10.000              │
│  Vuelto: $2.860                 │
│  TX: a1b2c3d4-...               │
│  ─────────────────────────────  │
│  [🖨 Imprimir]  [Nueva Venta]   │
└─────────────────────────────────┘
```

---

## 10. Estrategia de Pruebas / Testing Strategy

### Pruebas Unitarias / Unit Tests (Vitest)
- Casos de uso en `core/usecases/` con puertos mockeados
- Hooks `useSale`, `useCheckout`, `useReturn` con MSW
- Cobertura objetivo: ≥70% en módulos core

### Pruebas de Componentes / Component Tests (React Testing Library)
- `CartPanel`: agregar, actualizar, eliminar ítems
- `CheckoutModal`: flujo efectivo y crédito
- `DiscountForm`: porcentaje y monto fijo
- `BarcodeScanner`: entrada manual

### Pruebas E2E / E2E Tests (Playwright)
- Flujo completo: login → buscar producto → agregar al carrito → checkout efectivo → recibo
- Flujo crédito: asociar cliente → checkout crédito → recibo con referencia
- Flujo freeze/resume: congelar → nueva venta → reanudar → checkout
- Manejo de errores: 503, 409, 422 simulados con MSW

---

## 11. Variables de Entorno / Environment Variables

```env
VITE_SALES_API_URL=http://localhost:8080
VITE_TERMINAL_ID=TERM-001
VITE_STORE_NAME=Supermercado POS
```

---

## 12. Decisiones de Diseño / Design Decisions

| Decisión / Decision | Justificación ES | Justification EN |
|---|---|---|
| Vite en lugar de CRA | Build más rápido, HMR nativo, mejor DX | Faster build, native HMR, better DX |
| Zustand en lugar de Redux | API más simple, menos boilerplate para estado pequeño | Simpler API, less boilerplate for small state |
| Servidor como fuente de verdad | Evita inconsistencias de totales y stock entre cliente y servidor | Avoids total/stock inconsistencies between client and server |
| Tailwind + shadcn/ui | Componentes accesibles (Radix) + utilidades CSS rápidas | Accessible components (Radix) + fast CSS utilities |
| MSW para tests | Intercepta fetch/axios sin modificar código de producción | Intercepts fetch/axios without modifying production code |
| @zxing/browser para barcode | Librería madura, soporte multi-formato, funciona en browser | Mature library, multi-format support, works in browser |
