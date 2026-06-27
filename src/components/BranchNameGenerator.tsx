import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  buildBranchName,
  loadFormInputs,
  loadHistory,
  saveFormInputs,
  saveHistory,
  addHistoryEntry,
  type BranchHistoryEntry,
} from '@/lib/branchNameStorage'
import { useCopy } from '@/contexts/CopyContext'

export function BranchNameGenerator() {
  const { copy } = useCopy()
  const [jiraCode, setJiraCode] = useState(() => loadFormInputs().jiraCode)
  const [taskNumber, setTaskNumber] = useState(() => loadFormInputs().taskNumber)
  const [issueName, setIssueName] = useState(() => loadFormInputs().issueName)
  const [branchDev, setBranchDev] = useState('')
  const [branchStg, setBranchStg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<BranchHistoryEntry[]>(() => loadHistory())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    saveFormInputs({ jiraCode, taskNumber, issueName })
  }, [jiraCode, taskNumber, issueName])

  const canGenerate = jiraCode.trim().length > 0 && taskNumber.trim().length > 0

  const generate = () => {
    if (!canGenerate) {
      setError('Jira 課題コードとタスクNo.を入力してください')
      return
    }
    const dev = buildBranchName(jiraCode, taskNumber, 'dev')
    const stg = buildBranchName(jiraCode, taskNumber, 'stg')
    setBranchDev(dev)
    setBranchStg(stg)
    setError(null)
    addHistoryEntry({ jiraCode, taskNumber, issueName }, dev, stg)
    setHistory(loadHistory())
  }

  const copyText = (text: string) => {
    if (text) copy(text)
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(history.map((e) => e.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const deleteSelected = () => {
    if (selectedIds.size === 0) return
    const next = history.filter((e) => !selectedIds.has(e.id))
    saveHistory(next)
    setHistory(next)
    setSelectedIds(new Set())
  }

  const deleteAll = () => {
    saveHistory([])
    setHistory([])
    setSelectedIds(new Set())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ブランチ名生成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jira-code">Jira 課題コード</Label>
            <Input
              id="jira-code"
              placeholder="1234"
              value={jiraCode}
              onChange={(e) => setJiraCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-number">タスクNo.</Label>
            <Input
              id="task-number"
              placeholder="TASK-001"
              value={taskNumber}
              onChange={(e) => setTaskNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-name">課題名</Label>
            <Input
              id="issue-name"
              placeholder="ログイン画面のバグ修正"
              value={issueName}
              onChange={(e) => setIssueName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={!canGenerate}>
            生成
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {(branchDev || branchStg) && (
          <div className="space-y-3 rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">生成結果</p>
            </div>
            <div className="space-y-2">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 text-xs font-mono break-all min-[400px]:text-sm">
                  {branchDev}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => copyText(branchDev)}
                >
                  dev コピー
                </Button>
              </div>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 text-xs font-mono break-all min-[400px]:text-sm">
                  {branchStg}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => copyText(branchStg)}
                >
                  stg コピー
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">生成履歴</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button variant="ghost" size="sm" onClick={selectAll} disabled={history.length === 0}>
                全選択
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection} disabled={selectedIds.size === 0}>
                選択解除
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
              >
                選択削除
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteAll}
                disabled={history.length === 0}
              >
                一括削除
              </Button>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">履歴はまだありません</p>
          ) : (
            <ul className="space-y-3">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-sm border border-border bg-card p-3 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`hist-${entry.id}`}
                      checked={selectedIds.has(entry.id)}
                      onCheckedChange={(c) => toggleSelect(entry.id, c === true)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label
                        htmlFor={`hist-${entry.id}`}
                        className="block font-medium text-foreground cursor-pointer break-words"
                      >
                        {entry.issueName || '（課題名なし）'}
                      </Label>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <code className="min-w-0 flex-1 text-xs font-mono break-all">
                          {entry.branchDev}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full shrink-0 sm:w-auto"
                          onClick={() => copyText(entry.branchDev)}
                        >
                          dev
                        </Button>
                      </div>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <code className="min-w-0 flex-1 text-xs font-mono break-all">
                          {entry.branchStg}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full shrink-0 sm:w-auto"
                          onClick={() => copyText(entry.branchStg)}
                        >
                          stg
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
