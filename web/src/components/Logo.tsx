import { useId } from 'react'
import { cn } from '@/lib/utils'

// The B-snap mark from Desktop/logo/B-snap-animated.svg, inlined so it animates with CSS
// and stays crisp at any size. `still` freezes it (used in tight spots).
const B_PATH =
  'M155 118 L274 118 C327 118 353 146 353 188 C353 214 340 234 321 243 C352 253 370 277 370 312 C370 359 336 390 279 390 L155 390Z M216 171 L268 171 C288 171 299 181 299 197 C299 214 288 224 268 224 L216 224Z M216 278 L277 278 C300 278 313 288 313 307 C313 327 300 338 277 338 L216 338Z'

export function Logo({ className, still, color = '#f6f6f5' }: { className?: string; still?: boolean; color?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 512 512" className={cn(still && 'snap-still', className)} role="img" aria-label="Bakery">
      <defs>
        <path id={`b-${id}`} fillRule="evenodd" d={B_PATH} />
        <clipPath id={`top-${id}`}>
          <path d="M0 0H512V212.56L0 274Z" />
        </clipPath>
        <clipPath id={`bottom-${id}`}>
          <path d="M0 284L512 222.56V512H0Z" />
        </clipPath>
        <mask id={`stripes-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill="white" />
          <path d="M80 233.8L420 131.8 M80 246.8L420 144.8 M80 377.8L420 275.8 M80 390.8L420 288.8" fill="none" stroke="black" strokeWidth="3" />
        </mask>
      </defs>
      <g transform="matrix(1 0 -.13 1 33.28 0)" fill={color}>
        <g className="snap-top">
          <g clipPath={`url(#top-${id})`}>
            <use href={`#b-${id}`} mask={`url(#stripes-${id})`} />
          </g>
        </g>
        <g className="snap-bottom">
          <g clipPath={`url(#bottom-${id})`}>
            <use href={`#b-${id}`} mask={`url(#stripes-${id})`} />
          </g>
        </g>
      </g>
    </svg>
  )
}
