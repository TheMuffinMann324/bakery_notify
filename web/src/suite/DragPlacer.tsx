import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { customAnchor } from '@/components/Toasts'
import { STYLE_COMPONENTS } from '@/components/styles'
import { clear, getState, previewPrefs, previewSamples, useStore } from '@/lib/store'
import type { Toast } from '@/lib/types'

const GHOST: Toast = {
  key: -2,
  data: { type: 'info', title: 'Drag me', description: 'Let go where you want notifications.', icon: 'up-down-left-right' },
  type: 'info',
  position: 'custom',
  duration: 4000,
  persistent: true,
  version: 0,
  leaving: false,
}

// Full-screen placement mode: the suite steps aside and the player drags a real notification.
export function DragPlacer({ onDone }: { onDone: () => void }) {
  const prefs = useStore((s) => s.prefs)
  const before = useRef({ position: getState().prefs.position, customX: getState().prefs.customX, customY: getState().prefs.customY })
  const drag = useRef<{ x: number; y: number; left: number; top: number; w: number; h: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    clear()
    previewPrefs({ position: 'custom' })
  }, [])

  const finish = (keep: boolean) => {
    if (!keep) previewPrefs(before.current)
    onDone()
    previewSamples(2)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); finish(false) }
      if (e.key === 'Enter') { e.stopPropagation(); finish(true) }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    drag.current = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, w: r.width, h: r.height }
    setDragging(true)
  }
  // Track the box itself, then turn it into the anchor corner the stack uses. Working from the box
  // (not the anchor) keeps it under the cursor when it crosses the middle and the stack flips sides.
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const left = Math.min(vw - d.w, Math.max(0, d.left + e.clientX - d.x))
    const top = Math.min(vh - d.h, Math.max(0, d.top + e.clientY - d.y))
    const right = left + d.w / 2 > vw / 2
    const low = top + d.h / 2 > vh * 0.55
    previewPrefs({
      customX: ((right ? left + d.w : left) / vw) * 100,
      customY: ((low ? top + d.h : top) / vh) * 100,
    })
  }
  const up = () => {
    drag.current = null
    setDragging(false)
  }

  const a = customAnchor(prefs)
  const Style = STYLE_COMPONENTS[prefs.style]

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] bg-black/25">
      {/* guides */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />

      <div className="absolute inset-0" style={{ zoom: prefs.scale } as CSSProperties}>
        <div
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          className="absolute cursor-grab touch-none rounded-lg outline-2 outline-offset-4 outline-white/50 outline-dashed active:cursor-grabbing"
          style={{ ...a.style, opacity: prefs.opacity }}
        >
          <div className={dragging ? 'scale-[1.02] transition-transform' : 'transition-transform'}>
            <Style t={GHOST} bar={false} />
          </div>
        </div>
      </div>

      <div className="pop-in absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-white/[0.08] bg-[#111317]/95 py-2 pr-2 pl-4 shadow-[0_18px_48px_rgba(0,0,0,0.6)]">
        <Move className="size-4 text-white/50" />
        <p className="text-[12px] font-bold">
          Drag the notification where you want it
          <span className="ml-2 text-white/35 tnum">
            {Math.round(prefs.customX)}%, {Math.round(prefs.customY)}%
          </span>
        </p>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => finish(false)}>Cancel</Button>
          <Button size="sm" onClick={() => finish(true)}>Done</Button>
        </div>
      </div>
    </div>
  )
}
