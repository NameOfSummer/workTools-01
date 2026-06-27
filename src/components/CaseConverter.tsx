import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  CASE_STYLE_LABELS,
  convertAllCases,
  type CaseStyle,
} from '@/lib/caseConvert'
import { useCopy } from '@/contexts/CopyContext'

/** 変換結果の表示順 */
const CASE_ORDER: CaseStyle[] = [
  'camel',
  'pascal',
  'snake',
  'screamingSnake',
  'kebab',
  'lower',
  'upper',
  'title',
]

/** ケース変換タブ (camelCase / snake_case など) */
export function CaseConverter() {
  const { copy } = useCopy()
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Record<CaseStyle, string> | null>(null)

  const convert = () => {
    if (!input.trim()) {
      setResults(null)
      return
    }
    setResults(convertAllCases(input))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ケース変換</CardTitle>
        <CardDescription>
          camelCase、snake_case、kebab-case などに変換できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="foo_bar, fooBar, Foo Bar"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] text-sm"
        />
        <Button onClick={convert} disabled={!input.trim()}>
          変換
        </Button>
        {results && (
          <div className="space-y-2 rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
            {CASE_ORDER.map((style) => (
              <div
                key={style}
                className="flex min-w-0 items-center gap-2"
              >
                <span className="shrink-0 text-xs font-medium text-muted-foreground w-28 min-[400px]:w-32">
                  {CASE_STYLE_LABELS[style]}
                </span>
                <span className="min-w-0 flex-1 break-all font-mono text-xs min-[400px]:text-sm">
                  {results[style]}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => copy(results[style])}
                  aria-label={`${CASE_STYLE_LABELS[style]}をコピー`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
