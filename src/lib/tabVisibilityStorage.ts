import { TAB_IDS, type TabId } from '@/lib/tabOrderStorage'

/** タブ表示設定の localStorage キー */
const STORAGE_KEY = 'worktools-tab-visibility'

/** タブ ID ごとの表示/非表示フラグ */
export type TabVisibility = Record<TabId, boolean>

/** 全タブを表示状態にした初期値を返す */
export function getDefaultTabVisibility(): TabVisibility {
  return Object.fromEntries(TAB_IDS.map((id) => [id, true])) as TabVisibility
}

/** localStorage からタブ表示設定を読み込む */
export function loadTabVisibility(): TabVisibility {
  const defaults = getDefaultTabVisibility()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<TabVisibility>
    return Object.fromEntries(
      TAB_IDS.map((id) => [id, parsed[id] ?? defaults[id]])
    ) as TabVisibility
  } catch {
    return defaults
  }
}

/** タブ表示設定を localStorage に保存する */
export function saveTabVisibility(visibility: TabVisibility): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility))
}

/** 現在表示中のタブ数を数える */
export function countVisibleTabs(visibility: TabVisibility): number {
  return TAB_IDS.filter((id) => visibility[id]).length
}
