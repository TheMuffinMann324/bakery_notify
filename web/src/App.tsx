import { useEffect } from 'react'
import { Viewport } from '@/components/Toasts'
import { Suite } from '@/suite/Suite'
import { clear, getState, hide, loadPrefs, notify, setConfig, setSettingsOpen } from '@/lib/store'
import { isNui, nui } from '@/lib/nui'
import type { NotifyData, ServerConfig } from '@/lib/types'

type Message =
  | { action: 'notify'; data: NotifyData }
  | { action: 'hide'; data: string | number }
  | { action: 'clear' }
  | { action: 'config'; data: Partial<ServerConfig> }
  | { action: 'prefs'; data: unknown }
  | { action: 'openSettings' }
  | { action: 'closeSettings' }

type Ready = { config?: Partial<ServerConfig>; prefs?: unknown }

export default function App() {
  useEffect(() => {
    const onMessage = (e: MessageEvent<Message>) => {
      const msg = e.data
      if (!msg || typeof msg !== 'object') return
      switch (msg.action) {
        case 'notify': return notify(msg.data)
        case 'hide': return hide(msg.data)
        case 'clear': return clear()
        case 'config': return setConfig(msg.data)
        case 'prefs': return loadPrefs(msg.data)
        case 'openSettings':
          if (getState().config.playerSettings) setSettingsOpen(true)
          else void nui('close')
          return
        case 'closeSettings': return setSettingsOpen(false)
      }
    }
    window.addEventListener('message', onMessage)

    // Handshake: tells Lua we can receive messages and gets config.lua + saved settings back.
    // Retry, since the page can load before the client script registers the callback.
    let tries = 0
    let timer = 0
    const handshake = () => {
      nui<Ready>('ready').then((r) => {
        if (r) {
          if (r.config) setConfig(r.config)
          if (r.prefs) loadPrefs(r.prefs)
          return
        }
        if (isNui && ++tries < 30) timer = window.setTimeout(handshake, 500)
      })
    }
    handshake()

    // `npm run dev` in a browser: open the settings menu so there's something to work on.
    if (!isNui) setSettingsOpen(true)

    return () => {
      window.removeEventListener('message', onMessage)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="dark">
      {!isNui && <div className="fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_70%_20%,#3a2340_0%,transparent_60%),radial-gradient(70%_60%_at_20%_90%,#123a44_0%,transparent_60%),linear-gradient(180deg,#14161c,#07080a)]" />}
      <Viewport />
      <Suite />
    </div>
  )
}
