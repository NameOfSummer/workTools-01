import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCopy } from '@/contexts/CopyContext'

/** ミリ秒タイムスタンプを日本語ロケールの日時文字列に変換する */
function formatLocalDate(ms: number): string {
  return new Date(ms).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** UNIX 時間 (ミリ秒) 取得・変換タブ */
export function UnixTimeTool() {
  const { copy } = useCopy()
  const [now, setNow] = useState(() => Date.now())
  const [inputMs, setInputMs] = useState('')
  const [convertedDate, setConvertedDate] = useState<string | null>(null)
  const [convertError, setConvertError] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  const copyNow = () => {
    copy(String(now))
  }

  const convertToDate = () => {
    const ms = Number(inputMs)
    if (!inputMs.trim() || !Number.isFinite(ms)) {
      setConvertError('有効なミリ秒の数値を入力してください')
      setConvertedDate(null)
      return
    }
    setConvertedDate(formatLocalDate(ms))
    setConvertError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>UNIX 時間（ミリ秒）</CardTitle>
        <CardDescription>現在の UNIX 時間を取得・変換</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
          <p className="text-sm text-muted-foreground mb-1">現在時刻（ミリ秒）</p>
          <p className="text-2xl font-mono font-semibold text-primary tabular-nums break-all min-[400px]:text-3xl">
            {now}
          </p>
          <p className="mt-2 text-xs text-muted-foreground break-words min-[400px]:text-sm">
            {formatLocalDate(now)}
          </p>
          <Button className="mt-3" size="sm" onClick={copyNow}>
            コピー
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unix-input">ミリ秒 → 日時変換</Label>
          <Input
            id="unix-input"
            placeholder="1704067200000"
            value={inputMs}
            onChange={(e) => setInputMs(e.target.value)}
            className="font-mono"
          />
          <Button variant="secondary" onClick={convertToDate}>
            変換
          </Button>
          {convertError && (
            <p className="text-sm text-destructive">{convertError}</p>
          )}
          {convertedDate && (
            <p className="text-sm font-medium">{convertedDate}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
