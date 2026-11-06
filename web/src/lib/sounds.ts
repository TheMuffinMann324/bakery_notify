import type { SoundId } from './types'

// Tiny synthesised UI sounds: no audio files to ship, and volume works (GTA frontend sounds have none).

export const SOUNDS: { id: SoundId; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'blip', name: 'Blip' },
  { id: 'pop', name: 'Pop' },
  { id: 'chime', name: 'Chime' },
  { id: 'soft', name: 'Soft' },
  { id: 'alert', name: 'Alert' },
  { id: 'buzz', name: 'Buzz' },
  { id: 'bell', name: 'Bell' },
]

type Note = { f: number; t: number; d: number; wave?: OscillatorType; glide?: number; g?: number }

const PATCHES: Record<Exclude<SoundId, 'none'>, Note[]> = {
  blip: [{ f: 1320, t: 0, d: 0.07, wave: 'square', g: 0.35 }],
  pop: [{ f: 520, t: 0, d: 0.09, wave: 'sine', glide: 980 }],
  chime: [
    { f: 1046.5, t: 0, d: 0.16, wave: 'triangle' },
    { f: 1568, t: 0.08, d: 0.28, wave: 'triangle' },
  ],
  soft: [{ f: 740, t: 0, d: 0.22, wave: 'sine', g: 0.8 }],
  alert: [
    { f: 880, t: 0, d: 0.09, wave: 'square', g: 0.3 },
    { f: 880, t: 0.13, d: 0.09, wave: 'square', g: 0.3 },
  ],
  buzz: [
    { f: 196, t: 0, d: 0.12, wave: 'sawtooth', g: 0.35 },
    { f: 165, t: 0.12, d: 0.16, wave: 'sawtooth', g: 0.35 },
  ],
  bell: [
    { f: 1318.5, t: 0, d: 0.6, wave: 'sine' },
    { f: 2637, t: 0, d: 0.3, wave: 'sine', g: 0.25 },
  ],
}

let ctx: AudioContext | null = null

export function playSound(id: SoundId, volume: number) {
  if (id === 'none' || volume <= 0) return
  const patch = PATCHES[id]
  if (!patch) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime + 0.01
    const master = ctx.createGain()
    master.gain.value = Math.min(1, volume) * 0.5
    master.connect(ctx.destination)
    for (const n of patch) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = n.wave ?? 'sine'
      osc.frequency.setValueAtTime(n.f, now + n.t)
      if (n.glide) osc.frequency.exponentialRampToValueAtTime(n.glide, now + n.t + n.d)
      const peak = n.g ?? 0.6
      gain.gain.setValueAtTime(0.0001, now + n.t)
      gain.gain.exponentialRampToValueAtTime(peak, now + n.t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)
      osc.connect(gain).connect(master)
      osc.start(now + n.t)
      osc.stop(now + n.t + n.d + 0.02)
    }
  } catch {
    /* no audio device */
  }
}
