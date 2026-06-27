const TOKEN_KEY = 'google_access_token'
const CALENDAR_ID_KEY = 'google_calendar_id'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ')

export interface GoogleCalendar {
  id: string
  summary: string
  primary?: boolean
}

function getClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
}

export function isGoogleConfigured(): boolean {
  return getClientId().length > 0
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredCalendarId(): string | null {
  return localStorage.getItem(CALENDAR_ID_KEY)
}

export function setStoredCalendarId(id: string): void {
  localStorage.setItem(CALENDAR_ID_KEY, id)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CALENDAR_ID_KEY)
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-gsi]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Google script failed')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleGsi = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed to load'))
    document.head.appendChild(script)
  })
}

export async function loginWithGoogle(): Promise<string> {
  const clientId = getClientId()
  if (!clientId) {
    throw new Error(
      'Google Client ID が設定されていません。環境変数 VITE_GOOGLE_CLIENT_ID を設定してください。'
    )
  }

  await loadGoogleScript()

  return new Promise((resolve, reject) => {
    const google = window.google
    if (!google?.accounts?.oauth2) {
      reject(new Error('Google OAuth が利用できません'))
      return
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        if (!response.access_token) {
          reject(new Error('アクセストークンを取得できませんでした'))
          return
        }
        localStorage.setItem(TOKEN_KEY, response.access_token)
        resolve(response.access_token)
      },
    })
    client.requestAccessToken()
  })
}

export async function logoutFromGoogle(): Promise<void> {
  const token = getStoredToken()
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {})
  }
  clearStoredAuth()
}

async function googleFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Google にログインしてください')
  }

  const response = await fetch(`https://www.googleapis.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth()
      throw new Error('認証が期限切れです。再度ログインしてください')
    }
    const body = await response.text()
    throw new Error(`Google API エラー: ${response.status} ${body}`)
  }

  return response.json() as Promise<T>
}

export async function fetchCalendarList(): Promise<GoogleCalendar[]> {
  const data = await googleFetch<{ items?: GoogleCalendar[] }>(
    '/calendar/v3/users/me/calendarList'
  )
  return data.items ?? []
}

export interface CalendarEventInput {
  title: string
  start: Date
  end: Date
  description?: string
}

export async function createCalendarEvent(event: CalendarEventInput): Promise<void> {
  const calendarId = getStoredCalendarId() ?? 'primary'

  await googleFetch(`/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    body: JSON.stringify({
      summary: event.title,
      description: event.description,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    }),
  })
}
