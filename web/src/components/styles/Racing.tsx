import { cn } from '@/lib/utils'
import { NotifyIcon } from '../NotifyIcon'
import { RichText } from '../RichText'
import { ACCENT, Countdown, safeStyle, type StyleProps } from './shared'

// ---------------------------------------------------------------------------
// Racing: the bakery_racing toast. Icon strip, heavy uppercase, success inverts to white.
// ---------------------------------------------------------------------------
export function Racing({ t, bar }: StyleProps) {
  const { title, description, icon, iconColor, iconAnimation, alignIcon, style } = t.data
  const light = t.type === 'success'
  return (
    <div
      className={cn(
        'relative flex w-[340px] items-stretch overflow-hidden rounded-md shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-md',
        // Paint dark under the strip so the rounded clip never bleeds a white fringe.
        light
          ? 'bg-[linear-gradient(to_right,#0b0c0f_2.5rem,#fff_2.5rem)] text-[#0b0c0f] [&_[data-gta]]:brightness-[0.62] [&_[data-gta]]:saturate-150'
          : 'bg-[#0b0c0f]/90 text-white',
      )}
      style={safeStyle(style)}
    >
      <div className={cn('flex w-10 shrink-0 justify-center', alignIcon === 'top' ? 'items-start pt-3' : 'items-center', light ? 'bg-[#0b0c0f] text-white' : 'bg-white/[0.06]')}>
        <NotifyIcon
          type={t.type}
          icon={icon}
          animation={iconAnimation}
          color={iconColor ?? (t.type === 'info' ? 'rgba(255,255,255,0.75)' : ACCENT[t.type])}
          className="size-4"
        />
      </div>
      <div className="min-w-0 flex-1 px-3.5 py-2.5">
        {title && <p className="truncate text-[11px] leading-tight font-black tracking-[0.12em] uppercase">{title}</p>}
        {description && (
          <p
            className={cn(
              'leading-snug break-words',
              title
                ? cn('mt-0.5 text-[12px] font-medium', light ? 'text-[#0b0c0f]/70' : 'text-white/60')
                : 'text-[12px] font-extrabold tracking-[0.02em] uppercase',
            )}
          >
            <RichText text={description} />
          </p>
        )}
      </div>
      {bar && <Countdown t={t} className={cn('right-0 left-10', light ? 'text-[#0b0c0f]/60' : t.type === 'info' ? 'text-white/45' : '')} color={light || t.type === 'info' ? undefined : ACCENT[t.type]} />}
    </div>
  )
}

