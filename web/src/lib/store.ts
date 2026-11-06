import { useSyncExternalStore } from 'react'
import {
  defaultConfig,
  defaultPrefs,
  POSITIONS,
  type HistoryEntry,
  type NotifyData,
  type NotifyType,
  type Position,
  type Prefs,
  type ServerConfig,
  type SoundId,
  type Toast,
} from './types'
import { playSound, SOUNDS } from './sounds'
import { nui } from './nui'
import { safeColor } from '@/components/styles/shared'

const TYPE_ALIASES: Record<string, NotifyType> = {
  info: 'info',
  inform: 'info',
  primary: 'info',
  default: 'info',
  police: 'info',
  ambulance: 'info',
  success: 'success',
  warning: 'warning',
  warn: 'warning',
  error: 'error',
  danger: 'error',
}

const EXIT_MS = 260

type State = {
  toasts: Toast[]
  config: ServerConfig
  /** what's on screen right now (live preview while the suite is open) */
  prefs: Prefs
  /** last saved, restored when the suite is closed without saving */
  saved: Prefs
  history: HistoryEntry[]
  settingsOpen: boolean
}

let state: State = {
  toasts: [],
  config: defaultConfig,
  prefs: defaultPrefs,
  saved: defaultPrefs,
  history: [],
  settingsOpen: false,
}
const listeners = new Set<() => void>()
const timers = new Map<number, number>()
let nextKey = 1

function set(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

export const getState = () => state

// ---------------------------------------------------------------------------
// Prefs
// ---------------------------------------------------------------------------
const clamp = (n: unknown, min: number, max: number, fallback: number) => {
  const v = Number(n)
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
}
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
const SOUND_IDS = SOUNDS.map((s) => s.id)

/** Anything loaded from KVP / the database goes through here, so a bad save can't break the UI. */
function sanitisePrefs(raw: unknown, base: Prefs = state.config.defaults): Prefs {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Prefs>
  const styles = state.config.styles
  const sounds = { ...base.sounds }
  if (p.sounds && typeof p.sounds === 'object') {
    for (const t of Object.keys(sounds) as NotifyType[]) {
      const s = (p.sounds as Record<string, unknown>)[t]
      if (typeof s === 'string' && SOUND_IDS.includes(s as SoundId)) sounds[t] = s as SoundId
    }
  }
  return {
    style: p.style && styles.includes(p.style) ? p.style : styles.includes(base.style) ? base.style : styles[0],
    position: p.position === 'custom' || (POSITIONS as string[]).includes(p.position as string) ? (p.position as Prefs['position']) : base.position,
    customX: clamp(p.customX, 0, 100, base.customX),
    customY: clamp(p.customY, 0, 100, base.customY),
    forcePosition: bool(p.forcePosition, base.forcePosition),
    scale: clamp(p.scale, 0.7, 1.4, base.scale),
    opacity: clamp(p.opacity, 0.4, 1, base.opacity),
    durationMul: clamp(p.durationMul, 0.5, 2.5, base.durationMul),
    showDuration: bool(p.showDuration, base.showDuration),
    reducedMotion: bool(p.reducedMotion, base.reducedMotion),
    mute: bool(p.mute, base.mute),
    volume: clamp(p.volume, 0, 1, base.volume),
    sounds,
    dnd: bool(p.dnd, base.dnd),
    dndAllowErrors: bool(p.dndAllowErrors, base.dndAllowErrors),
  }
}

export function setConfig(raw: Partial<ServerConfig>) {
  const config: ServerConfig = { ...defaultConfig, ...raw }
  if (!Array.isArray(config.styles) || !config.styles.length) config.styles = defaultConfig.styles
  state = { ...state, config }
  config.defaults = sanitisePrefs(raw.defaults, defaultPrefs)
  const prefs = sanitisePrefs(state.saved)
  set({ config, prefs, saved: prefs })
}

/** Saved prefs arrived (KVP or database). */
export function loadPrefs(raw: unknown) {
  const prefs = sanitisePrefs(raw)
  set({ prefs, saved: prefs })
}

/** Live change from the suite: shows straight away, not saved yet. */
export function previewPrefs(patch: Partial<Prefs>) {
  set({ prefs: { ...state.prefs, ...patch } })
}

export function savePrefs() {
  const prefs = state.prefs
  set({ saved: prefs })
  void nui('savePrefs', prefs)
}

function revertPrefs() {
  set({ prefs: state.saved })
}

export function resetPrefs() {
  set({ prefs: state.config.defaults })
}

export function setSettingsOpen(open: boolean) {
  if (!open && state.settingsOpen) {
    revertPrefs()
    void nui('close')
  }
  set({ settingsOpen: open, history: open ? state.history : state.history.map((h) => ({ ...h, missed: false })) })
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
function normaliseType(t?: string): NotifyType {
  return TYPE_ALIASES[(t ?? 'info').toLowerCase()] ?? 'info'
}

function resolvePosition(p?: string): Position | 'custom' {
  const prefs = state.prefs
  if (prefs.forcePosition || !p || !(POSITIONS as string[]).includes(p)) return prefs.position
  return p as Position
}

function schedule(t: Toast) {
  window.clearTimeout(timers.get(t.key))
  timers.delete(t.key)
  if (t.persistent) return
  timers.set(t.key, window.setTimeout(() => dismiss(t.key), t.duration))
}

function dismiss(key: number) {
  window.clearTimeout(timers.get(key))
  timers.delete(key)
  if (!state.toasts.some((t) => t.key === key && !t.leaving)) return
  set({ toasts: state.toasts.map((t) => (t.key === key ? { ...t, leaving: true } : t)) })
  window.setTimeout(() => set({ toasts: state.toasts.filter((t) => t.key !== key) }), EXIT_MS)
}

function record(key: number, data: NotifyData, type: NotifyType, missed: boolean) {
  const entry: HistoryEntry = {
    key,
    at: Date.now(),
    type,
    title: data.title,
    description: data.description,
    icon: data.icon,
    iconColor: data.iconColor,
    missed,
  }
  // An id update rewrites its row and moves it back to the top.
  const rest = state.history.filter((h) => h.key !== key)
  set({ history: [entry, ...rest].slice(0, Math.max(1, state.config.historySize)) })
}

function chime(type: NotifyType, sound?: NotifyData['sound']) {
  const prefs = state.prefs
  if (prefs.mute) return
  // A script asked for a specific GTA sound (ox_lib's `sound` field): let the game play it.
  if (sound) return void nui('playGtaSound', sound)
  playSound(prefs.sounds[type], prefs.volume)
}

type NotifyOptions = { silent?: boolean; skipHistory?: boolean }

export function notify(input: NotifyData | string, opts: NotifyOptions = {}) {
  const data: NotifyData = typeof input === 'string' ? { description: input } : { ...input }
  if (!data.title && !data.description) return
  data.iconColor = safeColor(data.iconColor)

  const { prefs, config } = state
  const type = normaliseType(data.type)
  const hasId = data.id !== undefined && data.id !== null && data.id !== ''
  const existing = hasId ? state.toasts.find((t) => !t.leaving && t.data.id === data.id) : undefined

  // Do Not Disturb: still logged, just not shown.
  const blocked = prefs.dnd && !(prefs.dndAllowErrors && type === 'error')
  // History rows share the toast's key, so id updates rewrite the same row.
  const key = existing?.key ?? nextKey++
  if (!opts.skipHistory) record(key, data, type, blocked)
  if (blocked) return

  const base = Number(data.duration) || config.duration
  const duration = Math.max(800, base * prefs.durationMul)
  const persistent = data.persistent === true
  const position = resolvePosition(data.position)

  // ox_lib behaviour: same id updates the live toast in place instead of stacking a new one.
  if (existing) {
    const updated: Toast = { ...existing, data, type, position, duration, persistent, version: existing.version + 1 }
    set({ toasts: state.toasts.map((t) => (t.key === existing.key ? updated : t)) })
    schedule(updated)
    return
  }

  const toast: Toast = { key, data, type, position, duration, persistent, version: 0, leaving: false }
  const toasts = [...state.toasts, toast]

  // Trim the oldest in this stack past the cap.
  const live = toasts.filter((t) => t.position === position && !t.leaving)
  const overflow = live.length - Math.max(1, config.maxVisible)
  set({ toasts })
  schedule(toast)
  for (let i = 0; i < overflow; i++) dismiss(live[i].key)

  if (!opts.silent) chime(type, data.sound)
}

export function hide(id: string | number) {
  state.toasts.filter((t) => t.data.id === id).forEach((t) => dismiss(t.key))
}

export function clear() {
  state.toasts.forEach((t) => dismiss(t.key))
}

export function clearHistory() {
  set({ history: [] })
}

const SAMPLES: NotifyData[] = [
  { type: 'success', title: 'Vehicle Stored', description: 'Your **Elegy RH8** was parked at Pillbox Garage.' },
  { type: 'error', title: 'Insufficient Funds', description: 'You need **$2,500** to buy this.' },
  { type: 'warning', title: 'Fuel Low', description: 'Tank is at 12%. Find a gas station.', icon: 'gas-pump' },
  { type: 'info', title: 'Race Invite', description: 'Mia invited you to **Vinewood Sprint**.', icon: 'flag-checkered' },
]

/** Fires sample toasts without touching history (used by the suite's live preview). */
export function previewSamples(count = 3) {
  clear()
  SAMPLES.slice(0, count).forEach((s, i) =>
    window.setTimeout(() => notify({ ...s, duration: 3500, position: undefined }, { skipHistory: true, silent: i > 0 }), 200 + i * 260),
  )
}
