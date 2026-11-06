import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { NotifyType } from '@/lib/types'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { Countdown, LABEL, safeStyle, type StyleProps } from './shared'

// App-icon tile per type: [top, bottom] of the gradient.
const TILE: Record<NotifyType, [string, string]> = {
  info: ['#4a4d57', '#26282e'],
  success: ['#4ade80', '#16a34a'],
  warning: ['#fcd34d', '#f59e0b'],
  error: ['#fb7185', '#e11d48'],
}

// ---------------------------------------------------------------------------
// Phone: the GTA6 in-game phone push. Frosted glass, app tile, "now" stamp.
// ---------------------------------------------------------------------------
export function Phone({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, alignIcon, style } = t.data
  const [top, bottom] = iconColor ? [iconColor, `color-mix(in srgb, ${iconColor} 60%, #000)`] : TILE[t.type]
  const heading = title ?? (description ? undefined : LABEL[t.type])
  return (
    <div
      className="relative w-[360px] overflow-hidden rounded-[20px] border border-white/[0.09] bg-[rgba(32,33,38,0.74)] p-3 pr-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
      style={safeStyle(style)}
    >
      <div className={cn('flex gap-3', alignIcon === 'top' || (title && description) ? 'items-start' : 'items-center')}>
        <div
          className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.3)]"
          style={{ background: `linear-gradient(165deg, ${top}, ${bottom})` } as CSSProperties}
        >
          <NotifyIcon type={t.type} icon={icon} animation={iconAnimation} color="#fff" className="size-[18px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
        </div>
        <div className="min-w-0 flex-1 pt-px">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[13.5px] leading-tight font-semibold tracking-[-0.005em]">
              {heading ?? <RichText text={description!} />}
            </p>
            <span className="shrink-0 text-[11px] text-white/40">now</span>
          </div>
          {heading && description && (
            <p className="mt-0.5 line-clamp-3 text-[13px] leading-snug break-words text-white/75">
              <RichText text={description} />
            </p>
          )}
        </div>
      </div>
      {bar && <Countdown t={t} className="right-5 bottom-[3px] left-5 rounded-full text-white/25" />}
    </div>
  )
}
