import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { BellOff, History, Move, Palette, RotateCcw, Send, SlidersHorizontal, Volume2, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { previewSamples, resetPrefs, savePrefs, setSettingsOpen, useStore } from '@/lib/store'
import { AppearanceSection, DndSection, HistorySection, PositionSection, SoundSection, StyleSection } from './sections'
import { DragPlacer } from './DragPlacer'

type Tab = 'style' | 'position' | 'appearance' | 'sound' | 'dnd' | 'history'

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'position', label: 'Position', icon: Move },
  { id: 'appearance', label: 'Appearance', icon: SlidersHorizontal },
  { id: 'sound', label: 'Sound', icon: Volume2 },
  { id: 'dnd', label: 'Do Not Disturb', icon: BellOff },
  { id: 'history', label: 'History', icon: History },
]

export function Suite() {
  const open = useStore((s) => s.settingsOpen)
  const dirty = useStore((s) => JSON.stringify(s.prefs) !== JSON.stringify(s.saved))
  const dnd = useStore((s) => s.prefs.dnd)
  const missed = useStore((s) => s.history.filter((h) => h.missed).length)
  const [tab, setTab] = useState<Tab>('style')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!open) setPlacing(false)
  }, [open])

  useEffect(() => {
    if (!open || placing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, placing])

  if (!open) return null
  if (placing) return <DragPlacer onDone={() => setPlacing(false)} />

  const save = () => {
    savePrefs()
    setSettingsOpen(false)
  }

  return (
    // Left edge of the screen stays clear so the live preview on the right is visible.
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onMouseDown={() => setSettingsOpen(false)}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="dark pop-in flex h-[600px] max-h-[92vh] w-[860px] max-w-[94vw] overflow-hidden rounded-lg border border-white/[0.07] bg-[#111317] text-white shadow-[0_24px_64px_rgba(0,0,0,0.8)]"
      >
        {/* Sidebar: the same icon rail as bakery_racing */}
        <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-[#111317] py-4">
          <div className="mb-2 flex size-10 items-center justify-center">
            <Logo className="size-9" />
          </div>
          <div className="mb-1 h-px w-7 bg-white/[0.06]" />
          {NAV.map((n) => {
            const Icon = n.icon
            const badge = n.id === 'history' && missed > 0 ? String(missed) : n.id === 'dnd' && dnd ? 'On' : null
            return (
              <NavButton key={n.id} active={tab === n.id} label={n.label} badge={badge} onClick={() => setTab(n.id)}>
                <Icon />
              </NavButton>
            )
          })}
          <div className="flex-1" />
          <NavButton active={false} label="Send test notifications" onClick={() => previewSamples(4)}>
            <Send />
          </NavButton>
        </nav>

        {/* Content */}
        <section className="relative flex min-w-0 flex-1 flex-col bg-[#0e0f13]">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" onClick={() => setSettingsOpen(false)} aria-label="Close">
            <X />
          </Button>
          <div key={tab} className="tab-fade min-h-0 flex-1 overflow-y-auto px-8 pt-7 pb-24">
            {tab === 'style' && <StyleSection />}
            {tab === 'position' && <PositionSection onDrag={() => setPlacing(true)} />}
            {tab === 'appearance' && <AppearanceSection />}
            {tab === 'sound' && <SoundSection />}
            {tab === 'dnd' && <DndSection />}
            {tab === 'history' && <HistorySection />}
          </div>

          {/* Floating actions: content scrolls under a soft fade instead of a bar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#0e0f13_30%,transparent)]" />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-5 left-8 z-10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            onClick={resetPrefs}
          >
            <RotateCcw /> Reset to defaults
          </Button>
          <div className="absolute right-5 bottom-5 z-10 flex items-center gap-2">
            {dirty && <span className="pop-in mr-1 text-[11px] font-bold text-white/40">Unsaved changes</span>}
            <Button variant="secondary" className="shadow-[0_8px_24px_rgba(0,0,0,0.5)]" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button className="shadow-[0_8px_24px_rgba(0,0,0,0.5)]" onClick={save} disabled={!dirty}>Save</Button>
          </div>
        </section>
      </div>
    </div>
  )
}

// bakery_racing's NavButton, plus a small badge (missed count / DND on).
function NavButton({ active, label, badge, onClick, children }: { active: boolean; label: string; badge?: string | null; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group relative flex size-10 items-center justify-center rounded-md transition-all duration-150 [&_svg]:size-[18px]',
        active ? 'bg-white text-[#0b0c0f]' : 'text-white/45 hover:bg-white/[0.07] hover:text-white',
      )}
    >
      {children}
      {badge && (
        <span className="tnum absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[8.5px] font-black text-[#0b0c0f] uppercase ring-2 ring-[#111317]">
          {badge}
        </span>
      )}
      <span className="pointer-events-none absolute left-full z-50 ml-3 rounded-[5px] bg-white px-2 py-1 text-[10.5px] font-extrabold tracking-[0.07em] whitespace-nowrap text-[#0b0c0f] uppercase opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}
