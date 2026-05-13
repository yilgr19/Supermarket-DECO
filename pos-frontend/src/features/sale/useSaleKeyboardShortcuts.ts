// ES: Atajos de teclado para acciones de la pantalla de venta
// EN: Keyboard shortcuts for sale screen actions

import { useEffect } from 'react'
import { SALE_KEYBOARD_SHORTCUTS, type SaleShortcutAction } from './saleKeyboardShortcuts'

export interface SaleKeyboardShortcutHandlers {
  onProductSearch: () => void
  onCustomerSearch: () => void
  onCheckout: () => void
  onFreeze: () => void
  onCancel: () => void
  onFrozenSales: () => void
  onCatalog: () => void
  onLogout: () => void
  onCloseModals: () => void
}

export interface SaleKeyboardShortcutAvailability {
  productSearch: boolean
  customerSearch: boolean
  checkout: boolean
  freeze: boolean
  cancel: boolean
  frozenSales: boolean
  catalog: boolean
  logout: boolean
}

function runAction(
  action: SaleShortcutAction,
  handlers: SaleKeyboardShortcutHandlers,
  availability: SaleKeyboardShortcutAvailability
) {
  switch (action) {
    case 'productSearch':
      if (availability.productSearch) handlers.onProductSearch()
      return
    case 'customerSearch':
      if (availability.customerSearch) handlers.onCustomerSearch()
      return
    case 'checkout':
      if (availability.checkout) handlers.onCheckout()
      return
    case 'freeze':
      if (availability.freeze) handlers.onFreeze()
      return
    case 'cancel':
      if (availability.cancel) handlers.onCancel()
      return
    case 'frozenSales':
      if (availability.frozenSales) handlers.onFrozenSales()
      return
    case 'catalog':
      if (availability.catalog) handlers.onCatalog()
      return
    case 'logout':
      if (availability.logout) handlers.onLogout()
      return
  }
}

export function useSaleKeyboardShortcuts(
  handlers: SaleKeyboardShortcutHandlers,
  availability: SaleKeyboardShortcutAvailability,
  modalOpen: boolean
) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      if (event.key === 'Escape') {
        if (modalOpen) {
          event.preventDefault()
          handlers.onCloseModals()
        }
        return
      }

      const shortcut = SALE_KEYBOARD_SHORTCUTS.find((item) => item.key === event.key)
      if (!shortcut) return

      event.preventDefault()
      runAction(shortcut.action, handlers, availability)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [availability, handlers, modalOpen])
}
