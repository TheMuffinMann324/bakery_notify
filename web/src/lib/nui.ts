declare global {
  interface Window {
    GetParentResourceName?: () => string
  }
}

export const isNui = typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function'
const resource = isNui ? window.GetParentResourceName!() : 'bakery_notify'

export async function nui<T = unknown>(event: string, data?: unknown): Promise<T | undefined> {
  if (!isNui) return undefined
  try {
    const res = await fetch(`https://${resource}/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data ?? {}),
    })
    return (await res.json()) as T
  } catch {
    return undefined
  }
}
