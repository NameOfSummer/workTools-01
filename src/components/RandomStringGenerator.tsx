import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCopy } from '@/contexts/CopyContext'

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const

type CharsetKey = keyof typeof CHARSETS

export function RandomStringGenerator() {
  const { copy } = useCopy()
  const [length, setLength] = useState(16)
  const [selected, setSelected] = useState<Set<CharsetKey>>(
    new Set(['lowercase', 'uppercase', 'numbers'])
  )
  const [result, setResult] = useState('')

  const toggleCharset = (key: CharsetKey, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(key)
    else next.delete(key)
    setSelected(next)
  }

  const generate = () => {
    const chars = [...selected].map((k) => CHARSETS[k]).join('')
    if (!chars) {
      setResult('')
      return
    }
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    const str = Array.from(array, (n) => chars[n % chars.length]).join('')
    setResult(str)
  }

  const copyResult = () => {
    if (result) copy(result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ランダム文字列生成</CardTitle>
        <CardDescription>文字種と長さを選んでランダム文字列を生成</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="length">文字数</Label>
          <Input
            id="length"
            type="number"
            min={1}
            max={1024}
            value={length}
            onChange={(e) => setLength(Math.max(1, Math.min(1024, Number(e.target.value) || 1)))}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(CHARSETS) as CharsetKey[]).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selected.has(key)}
                onCheckedChange={(c) => toggleCharset(key, c === true)}
              />
              <Label htmlFor={key} className="font-normal">
                {key === 'lowercase' && '小文字 (a-z)'}
                {key === 'uppercase' && '大文字 (A-Z)'}
                {key === 'numbers' && '数字 (0-9)'}
                {key === 'symbols' && '記号'}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate}>生成</Button>
          <Button variant="outline" onClick={copyResult} disabled={!result}>
            コピー
          </Button>
        </div>

        {result && (
          <Textarea
            readOnly
            value={result}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  )
}
