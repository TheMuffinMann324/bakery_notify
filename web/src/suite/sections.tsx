import { useEffect, useRef, useState } from 'react'
import { BellOff, Check, Hand, Play, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { NotifyIcon } from '@/components/NotifyIcon'
import { RichText } from '@/components/RichText'
import { STYLE_COMPONENTS } from '@/components/styles'
import { ACCENT, LABEL } from '@/components/styles/shared'
import { clearHistory, previewPrefs, previewSamples, useStore } from '@/lib/store'
import { playSound, SOUNDS } from '@/lib/sounds'
import { STYLES, type NotifyType, type Position, type Prefs, type SoundId, type Toast } from '@/lib/types'
import { Group, SectionHeader, Segmented, SliderRow, SwitchRow, timeAgo } from './bits'

const TYPES: NotifyType[] = ['info', 'success', 'warning', 'error']

/** Change a pref and replay a short sample so the player sees it on the real screen. */
function useLive() {
  const timer = useRef(0)
  return (patch: Partial<Prefs>, samples = 2) => {
    previewPrefs(patch)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => previewSamples(samples), 220)
  }
}

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------
const SAMPLE: Toast = {
  key: -1,
  data: { type: 'success', title: 'Vehicle Stored', description: 'Parked at **Pillbox Garage**.' },
  type: 'success',
  position: 'top-right',
  duration: 4000,
  persistent: true,
  version: 0,
  leaving: false,
}

export function StyleSection() {
  const current = useStore((s) => s.prefs.style)
  const allowed = useStore((s) => s.config.styles)
  const live = useLive()
  return (
    <>
      <SectionHeader title="Style" text="Pick a look. Every notification on the server uses it, for you only." />
      <div className="grid grid-cols-2 gap-3">
        {STYLES.filter((s) => allowed.includes(s.id)).map((s) => {
          const Comp = STYLE_COMPONENTS[s.id]
          const active = current === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => live({ style: s.id }, 3)}
              className={cn(
                'group relative overflow-hidden rounded-lg border text-left transition-all',
                active ? 'border-white/70 bg-white/[0.06]' : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]',
              )}
            >
              <div className="relative flex h-[104px] items-center justify-center overflow-hidden bg-[radial-gradient(90%_120%_at_80%_0%,rgba(90,50,110,0.35),transparent_60%),radial-gradient(80%_100%_at_0%_100%,rgba(20,80,90,0.3),transparent_60%),#0a0b0e]">
                <div className="pointer-events-none" style={{ zoom: 0.68 }}>
                  <Comp t={SAMPLE} bar={false} />
                </div>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <div>
                  <p className="text-[12px] font-black tracking-[0.1em] uppercase">{s.name}</p>
                  <p className="text-[11px] text-white/40">{s.blurb}</p>
                </div>
                <span className={cn('grid size-5 place-items-center rounded-full transition-all', active ? 'bg-white text-[#0b0c0f]' : 'bg-white/[0.06] text-transparent')}>
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Position
// ---------------------------------------------------------------------------
const GRID: (Position | null)[] = ['top-left', 'top', 'top-right', 'center-left', null, 'center-right', 'bottom-left', 'bottom', 'bottom-right']

export function PositionSection({ onDrag }: { onDrag: () => void }) {
  const prefs = useStore((s) => s.prefs)
  const live = useLive()
  return (
    <>
      <SectionHeader title="Position" text="Where notifications show up on your screen." />
      <div className="flex gap-5">
        <div className="relative aspect-video w-[340px] shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[linear-gradient(160deg,#1b1d24,#0a0b0e)]">
          <div className="absolute inset-3 grid grid-cols-3 grid-rows-3 gap-2">
            {GRID.map((p, i) =>
              p ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => live({ position: p }, 2)}
                  className={cn(
                    'flex rounded-[5px] border p-1.5 transition-all',
                    p.includes('left') ? 'justify-start' : p.includes('right') ? 'justify-end' : 'justify-center',
                    p.startsWith('top') ? 'items-start' : p.startsWith('bottom') ? 'items-end' : 'items-center',
                    prefs.position === p ? 'border-white/70 bg-white/[0.08]' : 'border-white/[0.06] hover:border-white/25 hover:bg-white/[0.04]',
                  )}
                >
                  <span className={cn('h-2.5 w-9 rounded-[3px]', prefs.position === p ? 'bg-white' : 'bg-white/20')} />
                </button>
              ) : (
                <div key={i} className="grid place-items-center text-[9px] font-black tracking-[0.2em] text-white/15 uppercase">screen</div>
              ),
            )}
          </div>
          {prefs.position === 'custom' && (
            <span
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]"
              style={{ left: `${prefs.customX}%`, top: `${prefs.customY}%` }}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <button
            type="button"
            onClick={onDrag}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
              prefs.position === 'custom' ? 'border-white/70 bg-white/[0.06]' : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20',
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/[0.07]">
              <Hand className="size-4" />
            </span>
            <span>
              <span className="block text-[12.5px] font-black tracking-[0.06em] uppercase">Drag to place</span>
              <span className="block text-[11.5px] text-white/40">
                {prefs.position === 'custom' ? `Custom spot set (${Math.round(prefs.customX)}%, ${Math.round(prefs.customY)}%)` : 'Put them anywhere on screen'}
              </span>
            </span>
          </button>
          <Group className="mb-0">
            <SwitchRow
              title="Always use my spot"
              text="Also move notifications that ask for their own position."
              checked={prefs.forcePosition}
              onChange={(v) => live({ forcePosition: v }, 1)}
            />
          </Group>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------
export function AppearanceSection() {
  const prefs = useStore((s) => s.prefs)
  const live = useLive()
  return (
    <>
      <SectionHeader title="Appearance" text="Size, see-through and timing." />
      <Group>
        <SliderRow title="Size" value={prefs.scale} min={0.7} max={1.4} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => previewPrefs({ scale: v })} onCommit={(v) => live({ scale: v })} />
        <SliderRow title="Opacity" value={prefs.opacity} min={0.4} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => previewPrefs({ opacity: v })} onCommit={(v) => live({ opacity: v })} />
        <SliderRow
          title="Time on screen"
          text="Multiplies how long each notification stays."
          value={prefs.durationMul}
          min={0.5}
          max={2.5}
          step={0.25}
          format={(v) => `${v.toFixed(2).replace(/0$/, '')}x`}
          onChange={(v) => previewPrefs({ durationMul: v })}
          onCommit={(v) => live({ durationMul: v })}
        />
      </Group>
      <Group>
        <SwitchRow title="Countdown bar" text="Shows how long is left." checked={prefs.showDuration} onChange={(v) => live({ showDuration: v })} />
        <SwitchRow title="Reduce motion" text="No slide or blur, notifications just appear." checked={prefs.reducedMotion} onChange={(v) => live({ reducedMotion: v })} />
      </Group>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
export function SoundSection() {
  const prefs = useStore((s) => s.prefs)
  const setSound = (type: NotifyType, id: SoundId) => {
    previewPrefs({ sounds: { ...prefs.sounds, [type]: id } })
    playSound(id, prefs.volume)
  }
  return (
    <>
      <SectionHeader title="Sound" text="A sound for each kind of notification." />
      <Group>
        <SwitchRow title="Mute all" checked={prefs.mute} onChange={(v) => previewPrefs({ mute: v })} />
        <SliderRow
          title="Volume"
          value={prefs.volume}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => previewPrefs({ volume: v })}
          onCommit={(v) => playSound(prefs.sounds.success, v)}
        />
      </Group>
      <Group label="Per type">
        {TYPES.map((type) => (
          <div key={type} className={cn('flex items-center gap-3 px-4 py-2.5', prefs.mute && 'opacity-40')}>
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.05]">
              <NotifyIcon type={type} color={ACCENT[type]} className="size-4" />
            </span>
            <p className="flex-1 text-[12.5px] font-bold">{LABEL[type]}</p>
            <Select value={prefs.sounds[type]} onValueChange={(v) => setSound(type, v as SoundId)} disabled={prefs.mute}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOUNDS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="secondary" size="icon" disabled={prefs.mute || prefs.sounds[type] === 'none'} onClick={() => playSound(prefs.sounds[type], prefs.volume)}>
              <Play />
            </Button>
          </div>
        ))}
      </Group>
      <p className="text-[11.5px] text-white/30">Scripts that ask for a specific GTA sound still play it, unless you mute all.</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Do Not Disturb
// ---------------------------------------------------------------------------
export function DndSection() {
  const prefs = useStore((s) => s.prefs)
  const missed = useStore((s) => s.history.filter((h) => h.missed).length)
  return (
    <>
      <SectionHeader title="Do Not Disturb" text="Hide notifications for a while. They still land in History." />
      <button
        type="button"
        onClick={() => previewPrefs({ dnd: !prefs.dnd })}
        className={cn(
          'mb-5 flex w-full items-center gap-4 rounded-lg border p-5 text-left transition-all',
          prefs.dnd ? 'border-white/70 bg-white text-[#0b0c0f]' : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20',
        )}
      >
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-md', prefs.dnd ? 'bg-[#0b0c0f] text-white' : 'bg-white/[0.07]')}>
          <BellOff className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-black tracking-tight uppercase">{prefs.dnd ? 'Do Not Disturb is on' : 'Do Not Disturb is off'}</span>
          <span className={cn('block text-[12px]', prefs.dnd ? 'text-[#0b0c0f]/60' : 'text-white/40')}>
            {prefs.dnd ? `${missed} missed so far` : 'Tap to silence notifications'}
          </span>
        </span>
        <Switch checked={prefs.dnd} className="pointer-events-none" />
      </button>
      <Group>
        <SwitchRow title="Let errors through" text="Error notifications still show while it's on." checked={prefs.dndAllowErrors} onChange={(v) => previewPrefs({ dndAllowErrors: v })} />
      </Group>
    </>
  )
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
type Filter = 'all' | NotifyType

export function HistorySection() {
  const history = useStore((s) => s.history)
  const [filter, setFilter] = useState<Filter>('all')
  const [, tick] = useState(0)
  useEffect(() => {
    const i = window.setInterval(() => tick((n) => n + 1), 15000)
    return () => window.clearInterval(i)
  }, [])
  const list = filter === 'all' ? history : history.filter((h) => h.type === filter)
  return (
    <>
      <SectionHeader
        title="History"
        text="Recent notifications, newest first."
        action={
          <Button variant="ghost" size="sm" onClick={clearHistory} disabled={!history.length}>
            <Trash2 /> Clear
          </Button>
        }
      />
      <Segmented
        className="mb-4"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'all', label: 'All' }, ...TYPES.map((t) => ({ value: t, label: LABEL[t] }))]}
      />
      {list.length === 0 ? (
        <div className="grid h-48 place-items-center rounded-lg border border-dashed border-white/[0.08] text-center">
          <div>
            <p className="text-[12.5px] font-extrabold tracking-[0.06em] text-white/60 uppercase">Nothing yet</p>
            <p className="mt-1 text-[11.5px] text-white/30">Notifications you get show up here.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05] overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.025]">
          {list.map((h) => (
            <div key={h.key} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.05]">
                <NotifyIcon type={h.type} icon={h.icon} color={h.iconColor ?? ACCENT[h.type]} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="truncate text-[12.5px] font-extrabold">{h.title ?? LABEL[h.type]}</p>
                  {h.missed && <span className="shrink-0 rounded-[3px] bg-white/[0.08] px-1.5 py-px text-[9px] font-black tracking-[0.1em] text-white/60 uppercase">Missed</span>}
                  <span className="ml-auto shrink-0 text-[11px] text-white/30">{timeAgo(h.at)}</span>
                </div>
                {h.description && (
                  <p className="mt-0.5 text-[12px] leading-snug break-words text-white/55">
                    <RichText text={h.description} />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
