import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** 経過ミリ秒を HH:MM:SS.cc 形式の文字列にフォーマットする */
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

/** ストップウォッチタブ */
export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)

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
    setEndTime(new Date())
    if (startRef.current !== null) {
      setElapsed(Date.now() - startRef.current)
    }
  }

  const reset = () => {
    clearTimer()
    setRunning(false)
    setElapsed(0)
    setStartTime(null)
    setEndTime(null)
    startRef.current = null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ストップウォッチ</CardTitle>
        <CardDescription>経過時間を計測できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center py-6 min-[400px]:py-8">
          <p className="text-4xl font-mono font-bold tabular-nums text-primary min-[400px]:text-5xl">
            {formatElapsed(elapsed)}
          </p>
          {startTime && (
            <div className="mt-4 max-w-full space-y-1 px-1 text-center text-xs text-muted-foreground min-[400px]:text-sm">
              <p>開始: {startTime.toLocaleString('ja-JP')}</p>
              {endTime && <p>終了: {endTime.toLocaleString('ja-JP')}</p>}
            </div>
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
      </CardContent>
    </Card>
  )
}
