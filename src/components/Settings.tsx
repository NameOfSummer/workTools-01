import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'

export function Settings() {
  const {
    isConfigured,
    isLoggedIn,
    isLoading,
    calendars,
    selectedCalendarId,
    error,
    login,
    logout,
    selectCalendar,
    clearError,
  } = useGoogleAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>設定</CardTitle>
        <CardDescription>Google アカウントとカレンダーの設定</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Google アカウント</Label>
          {!isConfigured ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Client ID が未設定です</p>
              <p>
                ビルド時に環境変数 <code className="text-xs bg-muted px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> を設定してください。
              </p>
              <p className="mt-2">
                Google Cloud Console で OAuth 2.0 クライアントを作成し、
                承認済みの JavaScript 生成元に GitHub Pages の URL を追加してください。
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">
                {isLoggedIn ? 'ログイン済み' : '未ログイン'}
              </span>
              {isLoggedIn ? (
                <Button variant="outline" onClick={logout} disabled={isLoading}>
                  ログアウト
                </Button>
              ) : (
                <Button onClick={login} disabled={isLoading}>
                  Google でログイン
                </Button>
              )}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>登録先カレンダー</Label>
          {isLoggedIn && calendars.length > 0 ? (
            <Select
              value={selectedCalendarId ?? undefined}
              onValueChange={selectCalendar}
            >
              <SelectTrigger>
                <SelectValue placeholder="カレンダーを選択" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((cal) => (
                  <SelectItem key={cal.id} value={cal.id}>
                    {cal.summary}
                    {cal.primary ? ' (メイン)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              ログイン後にカレンダー一覧が表示されます
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={clearError}>
              閉じる
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
