/** タブ並び順の localStorage キー */
const STORAGE_KEY = 'worktools-tab-order'

/** アプリ内で使えるタブ ID の一覧 */
export const TAB_IDS = [
  'stopwatch',
  'branch',
  'json',
  'sql',
  'case',
  'random',
  'unix',
  'color',
  'regex',
  'diff',
] as const

export type TabId = (typeof TAB_IDS)[number]

/** 初回表示・リセット時のデフォルト並び順 */
const DEFAULT_ORDER: TabId[] = [
  'branch',
  'json',
  'sql',
  'case',
  'diff',
  'random',
  'unix',
  'color',
  'stopwatch',
  'regex',
]

/** 文字列が有効な TabId かどうかを判定する */
function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value)
}

/**
 * 保存済みの並び順を正規化する
 * 無効な ID を除外し、新規追加タブを末尾に補完する
 */
export function normalizeTabOrder(saved: string[]): TabId[] {
  const valid = saved.filter(isTabId)
  const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id))
  return valid.length > 0 ? [...valid, ...missing] : [...DEFAULT_ORDER]
}

/** localStorage からタブ並び順を読み込む */
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

/** タブ並び順を localStorage に保存する */
export function saveTabOrder(order: TabId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}
