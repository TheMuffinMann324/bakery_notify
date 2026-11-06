import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { NotifyType, Toast } from '@/lib/types'

export type StyleProps = { t: Toast; bar: boolean }

export const ACCENT: Record<NotifyType, string> = {
  info: '#f6f6f5',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
}

export const LABEL: Record<NotifyType, string> = { info: 'Info', success: 'Success', warning: 'Warning', error: 'Error' }

// Anything CSS could use to load outside content (images, fonts, imports).
const UNSAFE_CSS = /url|image|expression|import|\\/i

// ox_lib's `style` is a Mantine Sx object. Keep flat CSS properties with harmless values only.
// (The client script already filters this; this is the second line.)
export function safeStyle(style?: Record<string, unknown>): CSSProperties | undefined {
  if (!style || typeof style !== 'object') return undefined
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(style)) {
    if (!/^[a-zA-Z]{1,32}$/.test(k)) continue
    if (typeof v === 'number' || (typeof v === 'string' && v.length <= 64 && !UNSAFE_CSS.test(v))) out[k] = v
  }
  return out as CSSProperties
}

/** Plain colours only (#hex, rgb(), hsl(), names), since it gets dropped into gradients and CSS vars. */
export function safeColor(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 32) return undefined
  const v = value.replace(/\s/g, '').toLowerCase()
  return /^(#[0-9a-f]{3,8}|rgba?\([\d.,%/]+\)|hsla?\([\d.,%/deg]+\)|[a-z]+)$/.test(v) ? value : undefined
}

/** Bottom countdown line. Keyed on version so an id update restarts it. */
export function Countdown({ t, className, color, style }: { t: Toast; className?: string; color?: string; style?: CSSProperties }) {
  return (
    <div className={cn('absolute bottom-0 h-[2px] overflow-hidden', className)} style={color ? { color, ...style } : style}>
      <div key={t.version} className="nt-countdown h-full w-full origin-left bg-current" style={{ animationDuration: `${t.duration}ms` }} />
    </div>
  )
}
