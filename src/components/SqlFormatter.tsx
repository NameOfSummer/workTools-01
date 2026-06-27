import { useState } from 'react'
import { format, type SqlLanguage } from 'sql-formatter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCopy } from '@/contexts/CopyContext'

/** SQL 方言の選択肢一覧 */
const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sql', label: 'Standard SQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'bigquery', label: 'BigQuery' },
]

/** SQL 整形・圧縮タブ */
export function SqlFormatter() {
  const { copy } = useCopy()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<SqlLanguage>('postgresql')

  /**
   * sql-formatter で SQL を整形する
   * @param dense true なら圧縮モード (denseOperators)
   */
  const formatSql = (dense = false) => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }
    try {
      const formatted = format(input, {
        language,
        keywordCase: 'upper',
        tabWidth: dense ? 0 : 2,
        denseOperators: dense,
      })
      setOutput(formatted)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SQLの整形に失敗しました')
      setOutput('')
    }
  }

  const copyOutput = () => {
    if (output) copy(output)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL 整形</CardTitle>
        <CardDescription>SQL を読みやすい形に整形できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as SqlLanguage)}
          >
            <SelectTrigger id="sql-dialect" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="SELECT * FROM users WHERE id = 1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[160px] font-mono text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => formatSql(false)}>整形</Button>
          <Button variant="secondary" onClick={() => formatSql(true)}>
            圧縮
          </Button>
          <Button variant="outline" onClick={copyOutput} disabled={!output}>
            コピー
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {output && (
          <Textarea
            readOnly
            value={output}
            className="min-h-[160px] font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  )
}
