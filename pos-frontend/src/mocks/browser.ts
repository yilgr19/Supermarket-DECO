// ES: Service Worker MSW para desarrollo en navegador
// EN: MSW service worker for browser development

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
