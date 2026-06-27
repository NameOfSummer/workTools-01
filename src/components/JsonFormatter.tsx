import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSONの解析に失敗しました')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSONの解析に失敗しました')
      setOutput('')
    }
  }

  const copyOutput = async () => {
    if (output) await navigator.clipboard.writeText(output)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>JSON 整形</CardTitle>
        <CardDescription>JSON を整形・圧縮できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder='{"key": "value"}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[160px] font-mono text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={format}>整形</Button>
          <Button variant="secondary" onClick={minify}>圧縮</Button>
          <Button variant="outline" onClick={copyOutput} disabled={!output}>
            コピー
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
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
