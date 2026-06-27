import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { TabId } from '@/lib/tabOrderStorage'
import {
  countVisibleTabs,
  loadTabVisibility,
  saveTabVisibility,
  type TabVisibility,
} from '@/lib/tabVisibilityStorage'

interface TabSettingsContextValue {
  visibility: TabVisibility
  setTabVisible: (id: TabId, visible: boolean) => void
  isLastVisibleTab: (id: TabId) => boolean
}

const TabSettingsContext = createContext<TabSettingsContextValue | null>(null)

/** タブの表示/非表示設定を管理する Provider */
export function TabSettingsProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState<TabVisibility>(() =>
    loadTabVisibility()
  )

  /**
   * タブの表示/非表示を切り替える
   * 最後の1つは非表示にできない
   */
  const setTabVisible = useCallback((id: TabId, visible: boolean) => {
    setVisibility((prev) => {
      if (!visible && prev[id] && countVisibleTabs(prev) <= 1) {
        return prev
      }
      const next = { ...prev, [id]: visible }
      saveTabVisibility(next)
      return next
    })
  }, [])

  /** 指定タブが唯一の表示タブかどうか (チェックボックス無効化用) */
  const isLastVisibleTab = useCallback(
    (id: TabId) => visibility[id] && countVisibleTabs(visibility) <= 1,
    [visibility]
  )

  const value = useMemo(
    () => ({ visibility, setTabVisible, isLastVisibleTab }),
    [visibility, setTabVisible, isLastVisibleTab]
  )

  return (
    <TabSettingsContext.Provider value={value}>
      {children}
    </TabSettingsContext.Provider>
  )
}

/** タブ設定コンテキストを取得する */
export function useTabSettings() {
  const ctx = useContext(TabSettingsContext)
  if (!ctx) {
    throw new Error('useTabSettings must be used within TabSettingsProvider')
  }
  return ctx
}
