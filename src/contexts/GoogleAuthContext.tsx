import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCalendarList,
  getStoredCalendarId,
  getStoredToken,
  isGoogleConfigured,
  loginWithGoogle,
  logoutFromGoogle,
  setStoredCalendarId,
  type GoogleCalendar,
} from '@/lib/googleAuth'

interface GoogleAuthContextValue {
  isConfigured: boolean
  isLoggedIn: boolean
  isLoading: boolean
  calendars: GoogleCalendar[]
  selectedCalendarId: string | null
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  selectCalendar: (id: string) => void
  refreshCalendars: () => Promise<void>
  clearError: () => void
}

const GoogleAuthContext = createContext<GoogleAuthContextValue | null>(null)

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getStoredToken())
  const [isLoading, setIsLoading] = useState(false)
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    () => getStoredCalendarId()
  )
  const [error, setError] = useState<string | null>(null)

  const refreshCalendars = useCallback(async () => {
    if (!getStoredToken()) return
    setIsLoading(true)
    try {
      const list = await fetchCalendarList()
      setCalendars(list)
      const stored = getStoredCalendarId()
      if (stored && list.some((c) => c.id === stored)) {
        setSelectedCalendarId(stored)
      } else {
        const primary = list.find((c) => c.primary) ?? list[0]
        if (primary) {
          setSelectedCalendarId(primary.id)
          setStoredCalendarId(primary.id)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'カレンダー一覧の取得に失敗しました')
      if (e instanceof Error && e.message.includes('認証')) {
        setIsLoggedIn(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      refreshCalendars()
    }
  }, [isLoggedIn, refreshCalendars])

  const login = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
      setIsLoggedIn(true)
      await refreshCalendars()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await logoutFromGoogle()
      setIsLoggedIn(false)
      setCalendars([])
      setSelectedCalendarId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const selectCalendar = (id: string) => {
    setSelectedCalendarId(id)
    setStoredCalendarId(id)
  }

  return (
    <GoogleAuthContext.Provider
      value={{
        isConfigured: isGoogleConfigured(),
        isLoggedIn,
        isLoading,
        calendars,
        selectedCalendarId,
        error,
        login,
        logout,
        selectCalendar,
        refreshCalendars,
        clearError: () => setError(null),
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  )
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext)
  if (!ctx) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  }
  return ctx
}
