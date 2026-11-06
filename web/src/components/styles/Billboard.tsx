import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { ACCENT, Countdown, LABEL, safeStyle, type StyleProps } from './shared'

// ---------------------------------------------------------------------------
// Billboard: louder GTA6 take. Slanted type tab, black-italic title, accent edge + glow.
// ---------------------------------------------------------------------------
export function Billboard({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, alignIcon, style } = t.data
  const accent = iconColor ?? ACCENT[t.type]
  return (
    <div className="w-[360px]" style={{ '--accent': accent } as CSSProperties}>
      <div className="ml-3 flex">
        <span className="inline-flex h-[18px] -skew-x-[14deg] items-center bg-[var(--accent)] px-2.5 text-[#0b0c0f] shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
          <span className="skew-x-[14deg] text-[9.5px] leading-none font-black tracking-[0.22em] uppercase">{LABEL[t.type]}</span>
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-[4px] rounded-tl-none border border-white/[0.07] bg-[#0b0c0f]/[0.88] text-white shadow-[0_18px_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
        style={safeStyle(style)}
      >
        {/* accent edge + glow */}
        <div className="absolute inset-y-0 left-0 w-[3px] bg-[var(--accent)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(120%_140%_at_0%_50%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_70%)]" />
        {/* speed stripes, a nod to the B-snap logo */}
        <div className="nt-stripes pointer-events-none absolute -top-2 right-0 h-16 w-28 opacity-70" />

        <div className={cn('relative flex gap-3 py-3 pr-4 pl-4', alignIcon === 'top' ? 'items-start' : 'items-center')}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[4px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] ring-inset">
            <NotifyIcon type={t.type} icon={icon} animation={iconAnimation} color={accent} className="size-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            {title && <p className="truncate pr-1 text-[15px] leading-[1.05] font-black tracking-[-0.01em] uppercase italic">{title}</p>}
            {description && (
              <p className={cn('leading-snug break-words', title ? 'mt-1 text-[12.5px] text-white/65' : 'text-[13.5px] font-extrabold tracking-[0.01em] text-white')}>
                <RichText text={description} />
              </p>
            )}
          </div>
        </div>
        {bar && <Countdown t={t} className="right-0 left-[3px] text-[var(--accent)] opacity-80" />}
      </div>
    </div>
  )
}
