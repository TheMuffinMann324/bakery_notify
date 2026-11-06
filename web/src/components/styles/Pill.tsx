import type { CSSProperties } from 'react'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { ACCENT, safeStyle, type StyleProps } from './shared'

const R = 12.5
const CIRC = 2 * Math.PI * R

// ---------------------------------------------------------------------------
// Pill: compact one-liner. The countdown is a ring around the icon.
// ---------------------------------------------------------------------------
export function Pill({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, style } = t.data
  const accent = iconColor ?? ACCENT[t.type]
  return (
    <div
      className="inline-flex max-w-[460px] items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#0b0c0f]/90 py-1.5 pr-4 pl-1.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
      style={{ '--accent': accent, ...safeStyle(style) } as CSSProperties}
    >
      <div className="relative grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)]">
        <NotifyIcon type={t.type} icon={icon} animation={iconAnimation} color={accent} className="size-3.5" />
        {bar && (
          <svg viewBox="0 0 28 28" className="absolute inset-0 -rotate-90">
            <circle
              key={t.version}
              cx="14"
              cy="14"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              className="nt-ring"
              style={{ '--c': `${CIRC}px`, animationDuration: `${t.duration}ms` } as CSSProperties}
            />
          </svg>
        )}
      </div>
      <p className="min-w-0 truncate text-[12.5px] leading-tight [&_br]:hidden">
        {title && <span className="text-[11.5px] font-extrabold tracking-[0.06em] uppercase">{title}</span>}
        {title && description && <span className="mx-1.5 text-white/25">·</span>}
        {description && (
          <span className={title ? 'text-white/65' : 'font-semibold text-white/90'}>
            <RichText text={description} />
          </span>
        )}
      </p>
    </div>
  )
}
