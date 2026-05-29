/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL API Gateway LocalStack (lambda-ventas). Si está definida, activa modo Lambda. */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SALES_API_URL?: string
  readonly VITE_TERMINAL_ID?: string
  readonly VITE_STORE_NAME?: string
  /** ES: 'false' desactiva MSW en desarrollo · EN: 'false' disables MSW in dev */
  readonly VITE_USE_MSW?: string
}
