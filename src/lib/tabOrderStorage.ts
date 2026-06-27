const STORAGE_KEY = 'worktools-tab-order'

export const TAB_IDS = [
  'stopwatch',
  'branch',
  'json',
  'random',
  'unix',
  'color',
  'regex',
  'diff',
] as const

export type TabId = (typeof TAB_IDS)[number]

const DEFAULT_ORDER: TabId[] = [
  'branch',
  'json',
  'diff',
  'random',
  'unix',
  'color',
  'stopwatch',
  'regex',
]

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value)
}

export function normalizeTabOrder(saved: string[]): TabId[] {
  const valid = saved.filter(isTabId)
  const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id))
  return valid.length > 0 ? [...valid, ...missing] : [...DEFAULT_ORDER]
}

export function loadTabOrder(): TabId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_ORDER]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_ORDER]
    return normalizeTabOrder(parsed)
  } catch {
    return [...DEFAULT_ORDER]
  }
}

export function saveTabOrder(order: TabId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}
