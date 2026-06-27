import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/** copied! トーストの表示時間 (ms) */
const COPIED_DURATION_MS = 500

interface CopyContextValue {
  copy: (text: string) => Promise<void>
}

const CopyContext = createContext<CopyContextValue | null>(null)

/**
 * クリップボードコピーと copied! トースト表示を提供する Provider
 */
export function CopyProvider({ children }: { children: ReactNode }) {
  const [showCopied, setShowCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  /** テキストをクリップボードにコピーし、短時間トーストを表示する */
  const copy = useCallback(async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setShowCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowCopied(false), COPIED_DURATION_MS)
  }, [])

  return (
    <CopyContext.Provider value={{ copy }}>
      {children}
      {showCopied && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-4 z-50 rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm min-[400px]:right-6 min-[400px]:top-6"
        >
          copied!
        </div>
      )}
    </CopyContext.Provider>
  )
}

/** コピーコンテキストを取得する */
export function useCopy() {
  const ctx = useContext(CopyContext)
  if (!ctx) {
    throw new Error('useCopy must be used within CopyProvider')
  }
  return ctx
}
