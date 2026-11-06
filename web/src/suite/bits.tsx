import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

export function SectionHeader({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 pr-12">
      <div>
        <h2 className="text-[20px] leading-none font-black tracking-tight uppercase">{title}</h2>
        {text && <p className="mt-1.5 text-[12px] text-white/40">{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function Group({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-5', className)}>
      {label && <p className="mb-2 text-[10px] font-extrabold tracking-[0.14em] text-white/40 uppercase">{label}</p>}
      <div className="divide-y divide-white/[0.05] overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.025]">{children}</div>
    </div>
  )
}

function Row({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-6 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[12.5px] font-bold">{title}</p>
        {text && <p className="mt-0.5 text-[11.5px] leading-snug text-white/40">{text}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SwitchRow({ title, text, checked, onChange, disabled }: { title: string; text?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Row title={title} text={text}>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </Row>
  )
}

export function SliderRow({ title, text, value, min, max, step, format, onChange, onCommit }: {
  title: string
  text?: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
  onCommit?: (v: number) => void
}) {
  return (
    <Row title={title} text={text}>
      <div className="flex w-60 items-center gap-3">
        <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} onValueCommit={([v]) => onCommit?.(v)} />
        <span className="tnum w-11 text-right text-[11.5px] font-bold text-white/70">{format(value)}</span>
      </div>
    </Row>
  )
}

export function Segmented<T extends string>({ value, options, onChange, className }: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex gap-0.5 rounded-md bg-white/[0.05] p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-7 items-center justify-center gap-1.5 rounded-[5px] px-3 text-[10.5px] font-extrabold tracking-[0.07em] whitespace-nowrap uppercase transition-all [&_svg]:size-3.5',
            value === o.value ? 'bg-white text-[#0b0c0f]' : 'text-white/50 hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function timeAgo(at: number) {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (s < 10) return 'now'
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
