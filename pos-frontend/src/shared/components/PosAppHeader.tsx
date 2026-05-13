// ES: Cabecera unificada de la aplicación POS
// EN: Unified POS application header

import type { ReactNode } from 'react'

type PosAppHeaderVariant = 'dark' | 'light'

interface PosAppHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  variant?: PosAppHeaderVariant
  sticky?: boolean
}

export function PosAppHeader({
  icon,
  title,
  subtitle,
  actions,
  variant = 'light',
  sticky = false,
}: PosAppHeaderProps) {
  const headerClass =
    variant === 'dark'
      ? `pos-app-header pos-app-header--dark${sticky ? ' pos-app-header--sticky' : ''}`
      : `pos-app-header${sticky ? ' pos-app-header--sticky' : ''}`

  const iconWrapClass =
    variant === 'dark' ? 'pos-app-header__icon pos-app-header__icon--dark' : 'pos-app-header__icon'

  return (
    <header className={headerClass}>
      <div className="pos-app-header__inner">
        <div className="pos-app-header__brand">
          <div className={iconWrapClass}>{icon}</div>
          <div className="pos-app-header__text">
            <h1 className="pos-app-header__title">{title}</h1>
            {subtitle ? <p className="pos-app-header__subtitle">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="pos-app-header__actions">{actions}</div> : null}
      </div>
    </header>
  )
}
