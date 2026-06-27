import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/** タブを閉じるまで有効な認証フラグ (sessionStorage) */
const AUTH_SESSION_KEY = 'worktools-auth'

/** 「ログイン状態を保持」用の認証フラグ (localStorage) */
const AUTH_PERSIST_KEY = 'worktools-auth-persist'

/** 有効な PIN の形式 (4桁数字) */
const PIN_PATTERN = /^\d{4}$/

/**
 * ビルド時に埋め込まれた PIN を取得する
 * 未設定または形式不正の場合は空文字
 */
export function getAppPin(): string {
  const raw = import.meta.env.VITE_APP_PIN ?? ''
  return PIN_PATTERN.test(raw) ? raw : ''
}

/** PIN 認証が必要かどうか (VITE_APP_PIN が有効な値のとき true) */
export function isPinRequired(): boolean {
  return getAppPin().length > 0
}

/** 入力 PIN が正しいか検証する */
function verifyPin(input: string): boolean {
  const expected = getAppPin()
  if (!expected) return true
  return PIN_PATTERN.test(input) && input === expected
}

/** ストレージ上で認証済みかどうかを判定する */
export function readAuthenticated(): boolean {
  if (!isPinRequired()) return true
  return (
    sessionStorage.getItem(AUTH_SESSION_KEY) === '1' ||
    localStorage.getItem(AUTH_PERSIST_KEY) === '1'
  )
}

/**
 * 認証状態をストレージに保存する
 * remember が true なら localStorage、false なら sessionStorage を使う
 */
function saveAuthSession(remember: boolean): void {
  if (remember) {
    localStorage.setItem(AUTH_PERSIST_KEY, '1')
    sessionStorage.removeItem(AUTH_SESSION_KEY)
  } else {
    sessionStorage.setItem(AUTH_SESSION_KEY, '1')
    localStorage.removeItem(AUTH_PERSIST_KEY)
  }
}

/** 保存済みの認証状態をすべて削除する */
export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  localStorage.removeItem(AUTH_PERSIST_KEY)
}

interface AuthContextValue {
  authed: boolean
  pinRequired: boolean
  login: (pin: string, remember: boolean) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** PIN 認証の状態管理 Provider */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => readAuthenticated())
  const pinRequired = isPinRequired()

  const login = useCallback((pin: string, remember: boolean) => {
    if (!verifyPin(pin)) return false
    saveAuthSession(remember)
    setAuthed(true)
    return true
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setAuthed(false)
  }, [])

  const value = useMemo(
    () => ({ authed, pinRequired, login, logout }),
    [authed, pinRequired, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** 認証コンテキストを取得する */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
