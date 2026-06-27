import { useMemo, useState } from 'react'
import { diffLines } from 'diff'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCopy } from '@/contexts/CopyContext'
import { cn } from '@/lib/utils'

export function DiffViewer() {
  const { copy } = useCopy()
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')

  const diffParts = useMemo(() => {
    if (!before && !after) return []
    return diffLines(before, after)
  }, [before, after])

  const diffText = useMemo(() => {
    return diffParts
      .map((part) => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '
        return part.value
          .split('\n')
          .filter((line, i, arr) => i < arr.length - 1 || line.length > 0)
          .map((line) => prefix + line)
          .join('\n')
      })
      .join('\n')
  }, [diffParts])

  const hasDiff = before.length > 0 || after.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>テキスト diff</CardTitle>
        <CardDescription>2つのテキストを比較（JSON・ログ向け）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        <div className="grid min-w-0 gap-4 min-[500px]:grid-cols-2">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="diff-before">変更前</Label>
            <Textarea
              id="diff-before"
              value={before}
              onChange={(e) => setBefore(e.target.value)}
              className="min-h-[160px] font-mono text-sm"
              placeholder="元のテキスト"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="diff-after">変更後</Label>
            <Textarea
              id="diff-after"
              value={after}
              onChange={(e) => setAfter(e.target.value)}
              className="min-h-[160px] font-mono text-sm"
              placeholder="比較するテキスト"
            />
          </div>
        </div>

        {hasDiff && (
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>diff 結果</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(diffText)}
                disabled={!diffText}
              >
                コピー
              </Button>
            </div>
            <pre
              className="max-h-80 overflow-auto rounded-sm border border-border bg-card p-3 text-xs font-mono leading-relaxed min-[400px]:p-4 min-[400px]:text-sm"
            >
              {diffParts.map((part, i) => (
                <span
                  key={i}
                  className={cn(
                    part.added && 'bg-secondary',
                    part.removed && 'bg-primary/15 line-through decoration-primary/40'
                  )}
                >
                  {part.value}
                </span>
              ))}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
