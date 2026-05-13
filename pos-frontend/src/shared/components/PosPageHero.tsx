// ES: Encabezado de página secundaria con icono y contexto
// EN: Secondary page hero with icon and context

import type { ReactNode } from 'react'

type PosPageHeroTone = 'violet' | 'sky' | 'amber'

interface PosPageHeroProps {
  icon: ReactNode
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  tone?: PosPageHeroTone
}

export function PosPageHero({
  icon,
  title,
  eyebrow,
  subtitle,
  tone = 'violet',
}: PosPageHeroProps) {
  return (
    <div className="pos-page-hero">
      <div className={`pos-page-hero__icon pos-page-hero__icon--${tone}`}>{icon}</div>
      <div className="pos-page-hero__text">
        {eyebrow ? <p className={`pos-page-hero__eyebrow pos-page-hero__eyebrow--${tone}`}>{eyebrow}</p> : null}
        <h1 className="pos-page-hero__title">{title}</h1>
        {subtitle ? <p className="pos-page-hero__subtitle">{subtitle}</p> : null}
      </div>
    </div>
  )
}
