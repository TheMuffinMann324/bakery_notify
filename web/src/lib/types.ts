export type NotifyType = 'info' | 'success' | 'warning' | 'error'

export type Position =
  | 'top'
  | 'top-right'
  | 'top-left'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'center-right'
  | 'center-left'

export const POSITIONS: Position[] = ['top-left', 'top', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom', 'bottom-right']

export type NotifyStyle = 'racing' | 'billboard' | 'phone' | 'pill' | 'news' | 'mission'

export const STYLES: { id: NotifyStyle; name: string; blurb: string }[] = [
  { id: 'racing', name: 'Racing', blurb: 'Icon strip, heavy type' },
  { id: 'billboard', name: 'Billboard', blurb: 'Slanted tab, edge glow' },
  { id: 'phone', name: 'Phone', blurb: 'Frosted push banner' },
  { id: 'pill', name: 'Pill', blurb: 'Compact one-liner' },
  { id: 'news', name: 'News', blurb: 'Broadcast lower third' },
  { id: 'mission', name: 'Mission', blurb: 'Centred mission card' },
]

export type IconAnimation =
  | 'spin'
  | 'spinPulse'
  | 'spinReverse'
  | 'pulse'
  | 'beat'
  | 'fade'
  | 'beatFade'
  | 'bounce'
  | 'shake'

interface GtaSound {
  name: string
  set: string
  bank?: string
}

/** Same shape as ox_lib's NotifyProps so payloads pass through untouched. */
export interface NotifyData {
  id?: string | number
  title?: string
  description?: string
  duration?: number
  showDuration?: boolean
  position?: Position
  type?: NotifyType | string
  icon?: string | [string, string]
  iconColor?: string
  iconAnimation?: IconAnimation
  alignIcon?: 'top' | 'center'
  style?: Record<string, unknown>
  sound?: GtaSound
  /** bakery_notify extras */
  persistent?: boolean
}

export type SoundId = 'none' | 'blip' | 'pop' | 'chime' | 'soft' | 'alert' | 'buzz' | 'bell'

/** What each player can change in /notifsettings. */
export interface Prefs {
  style: NotifyStyle
  /** 'custom' uses customX / customY (percent of the screen) */
  position: Position | 'custom'
  customX: number
  customY: number
  /** true: every notification goes to the player's spot, even ones that ask for another position */
  forcePosition: boolean
  scale: number
  opacity: number
  durationMul: number
  showDuration: boolean
  reducedMotion: boolean
  mute: boolean
  volume: number
  sounds: Record<NotifyType, SoundId>
  dnd: boolean
  dndAllowErrors: boolean
}

/** Server side, from config.lua. */
export interface ServerConfig {
  styles: NotifyStyle[]
  duration: number
  maxVisible: number
  offset: number
  playerSettings: boolean
  historySize: number
  defaults: Prefs
}

export const defaultPrefs: Prefs = {
  style: 'racing',
  position: 'top-right',
  customX: 70,
  customY: 12,
  forcePosition: false,
  scale: 1,
  opacity: 1,
  durationMul: 1,
  showDuration: true,
  reducedMotion: false,
  mute: false,
  volume: 0.4,
  sounds: { info: 'blip', success: 'chime', warning: 'alert', error: 'buzz' },
  dnd: false,
  dndAllowErrors: true,
}

export const defaultConfig: ServerConfig = {
  styles: STYLES.map((s) => s.id),
  duration: 3000,
  maxVisible: 5,
  offset: 24,
  playerSettings: true,
  historySize: 50,
  defaults: defaultPrefs,
}

export interface Toast {
  key: number
  data: NotifyData
  type: NotifyType
  position: Position | 'custom'
  duration: number
  persistent: boolean
  /** bumped when an existing id is re-sent, restarts the timer + countdown */
  version: number
  leaving: boolean
}

export interface HistoryEntry {
  key: number
  at: number
  type: NotifyType
  title?: string
  description?: string
  icon?: string | [string, string]
  iconColor?: string
  /** arrived while Do Not Disturb was on */
  missed: boolean
}
