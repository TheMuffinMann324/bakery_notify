import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { ACCENT, LABEL, safeStyle, type StyleProps } from './shared'

const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

// ---------------------------------------------------------------------------
// News: broadcast lower third. Slanted type block, wide bar, ticker countdown.
// ---------------------------------------------------------------------------
export function News({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, alignIcon, style } = t.data
  const accent = iconColor ?? ACCENT[t.type]
  const [time] = useState(clock)
  return (
    <div
      className="relative flex w-[400px] items-stretch shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      style={{ '--accent': accent, ...safeStyle(style) } as CSSProperties}
    >
      {/* type block, slanted into the bar */}
      <div className="relative z-10 flex w-[84px] shrink-0 flex-col items-center justify-center gap-1 rounded-l-[3px] bg-[var(--accent)] py-2 pr-3 text-[#0b0c0f] [clip-path:polygon(0_0,100%_0,calc(100%-12px)_100%,0_100%)]">
        <NotifyIcon type={t.type} icon={icon} animation={iconAnimation} color="#0b0c0f" className="size-4" />
        <span className="text-[8.5px] leading-none font-black tracking-[0.2em] uppercase">{LABEL[t.type]}</span>
      </div>

      <div className="relative -ml-3 min-w-0 flex-1 overflow-hidden rounded-r-[3px] bg-[#0b0c0f]/[0.92] py-2.5 pr-4 pl-6 text-white backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--accent)] opacity-50" />
        <div className={cn('flex gap-3', alignIcon === 'top' ? 'items-start' : 'items-center')}>
          <div className="min-w-0 flex-1">
            {title && <p className="truncate text-[13.5px] leading-tight font-black tracking-[0.03em] uppercase">{title}</p>}
            {description && (
              <p className={cn('leading-snug break-words', title ? 'mt-0.5 text-[12px] text-white/65' : 'text-[12.5px] font-bold tracking-[0.01em] text-white uppercase')}>
                <RichText text={description} />
              </p>
            )}
          </div>
          <span className="tnum shrink-0 self-start text-[10px] font-bold tracking-[0.08em] text-white/30">{time}</span>
        </div>
        {bar && (
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.06]">
            <div key={t.version} className="nt-countdown h-full w-full origin-left bg-[var(--accent)]" style={{ animationDuration: `${t.duration}ms` }} />
          </div>
        )}
      </div>
    </div>
  )
}
