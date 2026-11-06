import { Fragment, type ReactNode } from 'react'

// Notifications arrive from ox_lib (markdown-ish), ESX (GTA ~r~ colour codes) and QBCore (plain).
// This renders the common subset of both without pulling in a markdown library.

const GTA_COLOURS: Record<string, string | null> = {
  r: '#f87171',
  g: '#4ade80',
  b: '#60a5fa',
  y: '#fbbf24',
  o: '#fb923c',
  p: '#c084fc',
  q: '#f472b6',
  c: 'rgba(255,255,255,0.5)',
  m: 'rgba(255,255,255,0.5)',
  u: '#0b0c0f',
  w: null,
  s: null,
}

type Run = { text: string; color: string | null; bold: boolean }

function splitGta(input: string): Run[] {
  const runs: Run[] = []
  let color: string | null = null
  let bold = false
  const re = /~([a-zA-Z])~/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    if (m.index > last) runs.push({ text: input.slice(last, m.index), color, bold })
    const code = m[1].toLowerCase()
    if (code === 'n') runs.push({ text: '\n', color, bold })
    else if (code === 'h') bold = !bold
    else if (code in GTA_COLOURS) {
      color = GTA_COLOURS[code]
      if (code === 's' || code === 'w') bold = false
    }
    last = re.lastIndex
  }
  if (last < input.length) runs.push({ text: input.slice(last), color, bold })
  return runs
}

function markdown(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\n)/g
  let last = 0
  let i = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const k = `${keyBase}-${i++}`
    if (tok === '\n') out.push(<br key={k} />)
    else if (tok.startsWith('**') || tok.startsWith('__')) out.push(<strong key={k} className="font-black text-current">{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) out.push(<code key={k} className="rounded-[3px] bg-white/10 px-1 py-px font-mono text-[0.92em]">{tok.slice(1, -1)}</code>)
    else out.push(<em key={k}>{tok.slice(1, -1)}</em>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function RichText({ text }: { text: string }) {
  const normalised = text.replace(/<br\s*\/?>/gi, '\n')
  return (
    <>
      {splitGta(normalised).map((run, i) => {
        const content = markdown(run.text, String(i))
        if (!run.color && !run.bold) return <Fragment key={i}>{content}</Fragment>
        return (
          <span key={i} data-gta="" style={run.color ? { color: run.color } : undefined} className={run.bold ? 'font-black' : undefined}>
            {content}
          </span>
        )
      })}
    </>
  )
}

