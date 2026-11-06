import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { POSITIONS, type Position, type Prefs, type Toast } from '@/lib/types'
import { STYLE_COMPONENTS } from './styles'

type Anchor = { box: string; style?: CSSProperties; dx: string; dy: string; growUp: boolean }

// Where each stack sits, and which way toasts fly in from.
const ANCHOR: Record<Position, Anchor> = {
  top: { box: 'top-[var(--off)] left-1/2 -translate-x-1/2 items-center', dx: '0px', dy: '-14px', growUp: false },
  'top-right': { box: 'top-[var(--off)] right-[var(--off)] items-end', dx: '28px', dy: '0px', growUp: false },
  'top-left': { box: 'top-[var(--off)] left-[var(--off)] items-start', dx: '-28px', dy: '0px', growUp: false },
  bottom: { box: 'bottom-[var(--off)] left-1/2 -translate-x-1/2 items-center', dx: '0px', dy: '14px', growUp: true },
  'bottom-right': { box: 'bottom-[var(--off)] right-[var(--off)] items-end', dx: '28px', dy: '0px', growUp: true },
  'bottom-left': { box: 'bottom-[var(--off)] left-[var(--off)] items-start', dx: '-28px', dy: '0px', growUp: true },
  'center-right': { box: 'top-1/2 right-[var(--off)] -translate-y-1/2 items-end', dx: '28px', dy: '0px', growUp: false },
  'center-left': { box: 'top-1/2 left-[var(--off)] -translate-y-1/2 items-start', dx: '-28px', dy: '0px', growUp: false },
}

/**
 * The player's dragged spot. (customX, customY) is the stack's anchor corner in screen %:
 * on the right half the stack hangs left of it, on the bottom half it grows upwards.
 */
export function customAnchor(prefs: Pick<Prefs, 'customX' | 'customY'>): Anchor {
  const right = prefs.customX > 50
  const low = prefs.customY > 55
  return {
    box: cn(right ? 'items-end' : 'items-start'),
    style: {
      left: `${prefs.customX}%`,
      top: `${prefs.customY}%`,
      transform: `translate(${right ? '-100%' : '0'}, ${low ? '-100%' : '0'})`,
    },
    dx: right ? '28px' : '-28px',
    dy: '0px',
    growUp: low,
  }
}

export function Viewport() {
  const toasts = useStore((s) => s.toasts)
  const prefs = useStore((s) => s.prefs)
  const offset = useStore((s) => s.config.offset)

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-50 overflow-hidden', prefs.reducedMotion && 'nt-reduced')}
      style={{ '--off': `${offset}px`, zoom: prefs.scale, opacity: prefs.opacity } as CSSProperties}
    >
      {[...POSITIONS, 'custom' as const].map((pos) => {
        const list = toasts.filter((t) => t.position === pos)
        if (!list.length) return null
        const a = pos === 'custom' ? customAnchor(prefs) : ANCHOR[pos]
        // Newest sits nearest the anchored edge.
        const ordered = a.growUp ? list : [...list].reverse()
        return (
          <div key={pos} className={cn('absolute flex flex-col', a.box)} style={{ ...a.style, '--dx': a.dx, '--dy': a.dy } as CSSProperties}>
            {ordered.map((t) => (
              <Slot key={t.key} toast={t} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// Wraps a toast so leaving collapses its height (and gap) smoothly instead of snapping the stack.
function Slot({ toast }: { toast: Toast }) {
  const style = useStore((s) => s.prefs.style)
  const showDuration = useStore((s) => s.prefs.showDuration)
  const bar = !toast.persistent && (toast.data.showDuration ?? showDuration)
  const Style = STYLE_COMPONENTS[style] ?? STYLE_COMPONENTS.racing
  return (
    <div className={cn('nt-slot grid', toast.leaving && 'nt-slot-out')}>
      <div className="min-h-0">
        <div className={cn('pb-2', toast.leaving ? 'nt-exit' : 'nt-enter')}>
          <Style t={toast} bar={bar} />
        </div>
      </div>
    </div>
  )
}
