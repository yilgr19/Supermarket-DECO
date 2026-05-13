// ES: Definición de atajos de teclado en la pantalla de venta
// EN: Sale screen keyboard shortcut definitions

export type SaleShortcutAction =
  | 'productSearch'
  | 'customerSearch'
  | 'checkout'
  | 'freeze'
  | 'cancel'
  | 'frozenSales'
  | 'catalog'
  | 'logout'

export interface SaleShortcutDefinition {
  action: SaleShortcutAction
  key: string
  keys: string[]
  labelEs: string
  labelEn: string
}

export const SALE_KEYBOARD_SHORTCUTS: SaleShortcutDefinition[] = [
  {
    action: 'productSearch',
    key: 'F1',
    keys: ['F1'],
    labelEs: 'Buscar producto',
    labelEn: 'Search product',
  },
  {
    action: 'customerSearch',
    key: 'F2',
    keys: ['F2'],
    labelEs: 'Buscar cliente',
    labelEn: 'Search customer',
  },
  {
    action: 'checkout',
    key: 'F3',
    keys: ['F3'],
    labelEs: 'Checkout',
    labelEn: 'Checkout',
  },
  {
    action: 'freeze',
    key: 'F4',
    keys: ['F4'],
    labelEs: 'Congelar venta',
    labelEn: 'Freeze sale',
  },
  {
    action: 'cancel',
    key: 'F5',
    keys: ['F5'],
    labelEs: 'Cancelar venta',
    labelEn: 'Cancel sale',
  },
  {
    action: 'frozenSales',
    key: 'F6',
    keys: ['F6'],
    labelEs: 'Ventas congeladas',
    labelEn: 'Frozen sales',
  },
  {
    action: 'catalog',
    key: 'F7',
    keys: ['F7'],
    labelEs: 'Catálogo',
    labelEn: 'Catalog',
  },
  {
    action: 'logout',
    key: 'F8',
    keys: ['F8'],
    labelEs: 'Cerrar sesión',
    labelEn: 'Logout',
  },
]
