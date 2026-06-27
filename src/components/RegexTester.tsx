import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCopy } from '@/contexts/CopyContext'

/** 正規表現フラグの選択肢（UI 表示ラベル付き） */
const FLAG_OPTIONS = [
  { id: 'g', label: 'g（全体検索）' },
  { id: 'i', label: 'i（大文字小文字無視）' },
  { id: 'm', label: 'm（複数行）' },
  { id: 's', label: 's（. が改行にもマッチ）' },
] as const

type FlagId = (typeof FLAG_OPTIONS)[number]['id']

/** 1件のマッチ結果（位置・文字列・キャプチャグループ） */
interface RegexMatch {
  index: number
  match: string
  groups: string[]
}

/** 正規表現のマッチ確認・置換プレビューを行うタブ */
export function RegexTester() {
  const { copy } = useCopy()
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<Set<FlagId>>(new Set(['g']))
  const [testText, setTestText] = useState('')
  const [replacement, setReplacement] = useState('')

  const flagString = [...flags].join('')

  /** パターンに対するマッチ一覧と置換結果を算出する（不正な正規表現は error に格納） */
  const result = useMemo(() => {
    if (!pattern) {
      return { matches: [] as RegexMatch[], replaced: null as string | null, error: null }
    }
    try {
      const regex = new RegExp(pattern, flagString)
      const found: RegexMatch[] = []

      if (flags.has('g')) {
        for (const m of testText.matchAll(regex)) {
          found.push({
            index: m.index ?? 0,
            match: m[0],
            groups: m.slice(1),
          })
        }
      } else {
        const m = regex.exec(testText)
        if (m) {
          found.push({
            index: m.index ?? 0,
            match: m[0],
            groups: m.slice(1),
          })
        }
      }

      const replacedText =
        replacement.length > 0 ? testText.replace(regex, replacement) : null

      return { matches: found, replaced: replacedText, error: null }
    } catch (e) {
      return {
        matches: [] as RegexMatch[],
        replaced: null as string | null,
        error: e instanceof Error ? e.message : '正規表現が不正です',
      }
    }
  }, [pattern, flagString, flags, testText, replacement])

  /** フラグのオン/オフを切り替える */
  const toggleFlag = (id: FlagId, checked: boolean) => {
    const next = new Set(flags)
    if (checked) next.add(id)
    else next.delete(id)
    setFlags(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>正規表現テスター</CardTitle>
        <CardDescription>パターン・置換・マッチ一覧を確認</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        <div className="space-y-2">
          <Label htmlFor="regex-pattern">パターン</Label>
          <Input
            id="regex-pattern"
            placeholder="\\d+"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {FLAG_OPTIONS.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={`flag-${id}`}
                checked={flags.has(id)}
                onCheckedChange={(c) => toggleFlag(id, c === true)}
              />
              <Label htmlFor={`flag-${id}`} className="font-normal text-sm">
                {label}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="regex-text">テスト文字列</Label>
          <Textarea
            id="regex-text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
            placeholder="マッチ対象のテキスト"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regex-replace">置換文字列（任意）</Label>
          <Input
            id="regex-replace"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            className="font-mono"
            placeholder="$1"
          />
        </div>

        {result.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        {pattern && !result.error && (
          <div className="space-y-3 rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
            <p className="text-sm font-medium">マッチ {result.matches.length} 件</p>

            {result.matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">マッチなし</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {result.matches.map((m, i) => (
                  <li
                    key={`${m.index}-${i}`}
                    className="rounded-sm border border-border bg-card p-2 text-xs font-mono break-all"
                  >
                    <span className="text-muted-foreground">#{i + 1} index={m.index}</span>
                    <p className="mt-1">{m.match}</p>
                    {m.groups.length > 0 && (
                      <p className="mt-1 text-muted-foreground">
                        groups: [{m.groups.join(', ')}]
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result.replaced !== null && !result.error && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>置換結果</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(result.replaced ?? '')}
              >
                コピー
              </Button>
            </div>
            <Textarea
              readOnly
              value={result.replaced}
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
