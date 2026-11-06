import type { CSSProperties } from 'react'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { ACCENT, LABEL, safeStyle, type StyleProps } from './shared'

// ---------------------------------------------------------------------------
// Mission: open-world mission card. No box, just a fading band with a centred
// black-italic title, a ruled type label and a countdown that closes in from both ends.
// ---------------------------------------------------------------------------
export function Mission({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, style } = t.data
  const accent = iconColor ?? ACCENT[t.type]
  return (
    <div
      className="relative w-[380px] px-6 py-3 text-center text-white"
      style={{ '--accent': accent, ...safeStyle(style) } as CSSProperties}
    >
      {/* the band: dark in the middle, gone at the edges */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(8,9,12,0.82)_22%,rgba(8,9,12,0.82)_78%,transparent)]" />

      <div className="relative">
        <div className="flex items-center justify-center gap-2.5">
          <span className="h-px w-10 bg-[linear-gradient(90deg,transparent,var(--accent))]" />
          <NotifyIcon type={t.type} icon={icon} animation={iconAnimation} color={accent} className="size-3" />
          <span className="text-[9.5px] leading-none font-black tracking-[0.32em] text-[var(--accent)] uppercase">{LABEL[t.type]}</span>
          <span className="h-px w-10 bg-[linear-gradient(90deg,var(--accent),transparent)]" />
        </div>

        {title && (
          <p className="mt-1.5 truncate px-2 text-[22px] leading-[1.05] font-black tracking-[-0.01em] uppercase italic [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
            {title}
          </p>
        )}
        {description && (
          <p className={title ? 'mt-1 text-[12.5px] leading-snug break-words text-white/70' : 'mt-1.5 text-[15px] leading-snug font-extrabold break-words uppercase italic'}>
            <RichText text={description} />
          </p>
        )}

        {bar && (
          <div className="mx-auto mt-2.5 h-[2px] w-40 overflow-hidden">
            <div key={t.version} className="nt-countdown h-full w-full origin-center bg-[var(--accent)]" style={{ animationDuration: `${t.duration}ms` }} />
          </div>
        )}
      </div>
    </div>
  )
}
