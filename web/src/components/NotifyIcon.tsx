import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { ICONS } from '@/lib/icons'
import type { IconAnimation, NotifyType } from '@/lib/types'

// Accepts 'car', 'fa-solid fa-car', 'fab discord' or ['fas', 'car']. Only the name matters: the bundled
// icons are looked up by it, and the prefix is ignored.
function resolve(icon: string | [string, string]): IconDefinition | undefined {
  const raw = Array.isArray(icon) ? icon[1] : icon.trim().split(/\s+/).pop() ?? ''
  return ICONS[raw.replace(/^fa-/, '')]
}

const TYPE_ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert }

export function NotifyIcon({ type, icon, color, animation, className }: {
  type: NotifyType
  icon?: string | [string, string]
  color?: string
  animation?: IconAnimation
  className?: string
}) {
  const def = icon ? resolve(icon) : undefined
  if (def) {
    return (
      <FontAwesomeIcon
        icon={def}
        className={className}
        style={color ? { color } : undefined}
        fixedWidth
        spin={animation === 'spin'}
        spinPulse={animation === 'spinPulse'}
        spinReverse={animation === 'spinReverse'}
        pulse={animation === 'pulse'}
        beat={animation === 'beat'}
        fade={animation === 'fade'}
        beatFade={animation === 'beatFade'}
        bounce={animation === 'bounce'}
        shake={animation === 'shake'}
      />
    )
  }
  const Lucide = TYPE_ICONS[type]
  return <Lucide className={className} style={color ? { color } : undefined} strokeWidth={2.4} />
}
