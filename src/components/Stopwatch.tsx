import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCalendarEvent } from '@/lib/googleAuth'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const millis = Math.floor((ms % 1000) / 10)
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`
}

export function Stopwatch() {
  const { isLoggedIn, isConfigured } = useGoogleAuth()
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [eventTitle, setEventTitle] = useState('作業記録')
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const start = () => {
    const now = Date.now()
    startRef.current = now - elapsed
    setStartTime(new Date(now - elapsed))
    setEndTime(null)
    setRunning(true)
    setCalendarStatus(null)
    clearTimer()
    intervalRef.current = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Date.now() - startRef.current)
      }
    }, 10)
  }

  const stop = () => {
    clearTimer()
    setRunning(false)
    const end = new Date()
    setEndTime(end)
    if (startRef.current !== null) {
      setElapsed(Date.now() - startRef.current)
    }
    setShowCalendarDialog(true)
  }

  const reset = () => {
    clearTimer()
    setRunning(false)
    setElapsed(0)
    setStartTime(null)
    setEndTime(null)
    startRef.current = null
    setShowCalendarDialog(false)
    setCalendarStatus(null)
  }

  const saveToCalendar = async () => {
    if (!startTime || !endTime) return
    setIsSaving(true)
    setCalendarStatus(null)
    try {
      await createCalendarEvent({
        title: eventTitle.trim() || '作業記録',
        start: startTime,
        end: endTime,
        description: `ストップウォッチ記録（${formatElapsed(elapsed)}）`,
      })
      setCalendarStatus('Google カレンダーに登録しました')
      setTimeout(() => setShowCalendarDialog(false), 1500)
    } catch (e) {
      setCalendarStatus(
        e instanceof Error ? e.message : 'カレンダーへの登録に失敗しました'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>ストップウォッチ</CardTitle>
          <CardDescription>
            計測終了時に Google カレンダーへ予定を登録できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center py-8">
            <p className="text-5xl font-mono font-bold tabular-nums text-secondary">
              {formatElapsed(elapsed)}
            </p>
            {startTime && (
              <p className="mt-4 text-sm text-muted-foreground">
                開始: {startTime.toLocaleString('ja-JP')}
                {endTime && ` / 終了: ${endTime.toLocaleString('ja-JP')}`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {!running ? (
              <Button size="lg" onClick={start}>
                開始
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={stop}>
                停止
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={reset}>
              リセット
            </Button>
          </div>

          {!isConfigured && (
            <p className="text-center text-sm text-muted-foreground">
              カレンダー連携には設定タブで Google Client ID の設定が必要です
            </p>
          )}
          {isConfigured && !isLoggedIn && (
            <p className="text-center text-sm text-muted-foreground">
              カレンダー登録には設定タブで Google にログインしてください
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google カレンダーに登録</DialogTitle>
            <DialogDescription>
              計測時間（{formatElapsed(elapsed)}）を予定として登録します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="event-title">予定のタイトル</Label>
            <Input
              id="event-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="作業記録"
            />
            {startTime && endTime && (
              <p className="text-sm text-muted-foreground">
                {startTime.toLocaleString('ja-JP')} 〜 {endTime.toLocaleString('ja-JP')}
              </p>
            )}
          </div>

          {calendarStatus && (
            <p
              className={`text-sm ${
                calendarStatus.includes('失敗') || calendarStatus.includes('エラー')
                  ? 'text-destructive'
                  : 'text-secondary'
              }`}
            >
              {calendarStatus}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCalendarDialog(false)}>
              スキップ
            </Button>
            <Button
              onClick={saveToCalendar}
              disabled={!isLoggedIn || isSaving}
            >
              {isSaving ? '登録中...' : 'カレンダーに登録'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
