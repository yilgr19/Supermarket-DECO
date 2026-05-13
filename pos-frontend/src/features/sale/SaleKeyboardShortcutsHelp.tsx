// ES: Panel de ayuda de atajos de teclado
// EN: Keyboard shortcuts help panel

import { useEffect, useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { SALE_KEYBOARD_SHORTCUTS } from './saleKeyboardShortcuts'
import type { SaleKeyboardShortcutAvailability } from './useSaleKeyboardShortcuts'

const STORAGE_KEY = 'pos-shortcuts-panel-visible'

function readVisiblePreference(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored == null ? true : stored === 'true'
}

interface SaleKeyboardShortcutsHelpProps {
  availability: SaleKeyboardShortcutAvailability
}

export function SaleKeyboardShortcutsHelp({ availability }: SaleKeyboardShortcutsHelpProps) {
  const [visible, setVisible] = useState(readVisiblePreference)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(visible))
  }, [visible])

  if (!visible) {
    return (
      <button
        type="button"
        className="pos-shortcuts-toggle"
        onClick={() => setVisible(true)}
        aria-label="Mostrar atajos de teclado / Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" aria-hidden="true" />
        Atajos
      </button>
    )
  }

  return (
    <aside
      className="pos-shortcuts-panel"
      aria-label="Atajos de teclado / Keyboard shortcuts"
    >
      <div className="pos-shortcuts-panel__header">
        <p className="pos-shortcuts-panel__title">Atajos / Shortcuts</p>
        <button
          type="button"
          className="pos-shortcuts-panel__close"
          onClick={() => setVisible(false)}
          aria-label="Ocultar atajos / Hide shortcuts"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="pos-shortcuts-panel__list">
        {SALE_KEYBOARD_SHORTCUTS.map((shortcut) => {
          const enabled = availability[shortcut.action]
          return (
            <li
              key={shortcut.action}
              className={`pos-shortcuts-panel__item ${enabled ? '' : 'pos-shortcuts-panel__item--disabled'}`}
            >
              <span className="pos-shortcuts-panel__keys">
                {shortcut.keys.map((key) => (
                  <kbd key={key} className="pos-shortcuts-panel__key">
                    {key}
                  </kbd>
                ))}
              </span>
              <span className="pos-shortcuts-panel__label">
                {shortcut.labelEs}
                <span className="pos-shortcuts-panel__label-en"> / {shortcut.labelEn}</span>
              </span>
            </li>
          )
        })}
        <li className="pos-shortcuts-panel__item">
          <span className="pos-shortcuts-panel__keys">
            <kbd className="pos-shortcuts-panel__key">Esc</kbd>
          </span>
          <span className="pos-shortcuts-panel__label">
            Cerrar ventana
            <span className="pos-shortcuts-panel__label-en"> / Close dialog</span>
          </span>
        </li>
      </ul>
    </aside>
  )
}
