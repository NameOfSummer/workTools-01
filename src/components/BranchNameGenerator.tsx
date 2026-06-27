import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
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
import { cn } from '@/lib/utils'

/**
 * テキスト行とコピーアイコンボタンを並べる行コンポーネント
 * 生成結果・履歴の dev/stg ブランチ名表示に使う
 */
function CopyableRow({
  text,
  label,
  mono = false,
  onCopy,
  copyLabel,
}: {
  text: string
  label?: string
  mono?: boolean
  onCopy: (text: string) => void
  copyLabel: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      {label && (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <span
        className={cn(
          'min-w-0 flex-1 break-all text-sm text-foreground',
          mono && 'font-mono text-xs min-[400px]:text-sm'
        )}
      >
        {text}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => onCopy(text)}
        aria-label={copyLabel}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/** Jira 課題情報から dev/stg ブランチ名を生成し履歴を管理するタブ */
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

  /** フォーム入力を localStorage に自動保存する */
  useEffect(() => {
    saveFormInputs({ jiraCode, taskNumber, issueName })
  }, [jiraCode, taskNumber, issueName])

  /** 生成に必須の Jira コードとタスクNo. が揃っているか */
  const canGenerate = jiraCode.trim().length > 0 && taskNumber.trim().length > 0

  /** リセットボタンを有効にするか（何か入力・結果があるか） */
  const hasFormContent =
    issueName.trim().length > 0 ||
    jiraCode.trim().length > 0 ||
    taskNumber.trim().length > 0 ||
    branchDev.length > 0 ||
    branchStg.length > 0 ||
    error !== null

  /** フォーム・生成結果・エラーを初期状態に戻す */
  const resetForm = () => {
    setIssueName('')
    setJiraCode('')
    setTaskNumber('')
    setBranchDev('')
    setBranchStg('')
    setError(null)
    saveFormInputs({ jiraCode: '', taskNumber: '', issueName: '' })
  }

  /** dev/stg ブランチ名を生成し履歴に追加する */
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

  /** 空でなければクリップボードにコピーする */
  const copyText = (text: string) => {
    if (text) copy(text)
  }

  /** 履歴エントリの選択状態を切り替える */
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  /** 履歴をすべて選択する */
  const selectAll = () => {
    setSelectedIds(new Set(history.map((e) => e.id)))
  }

  /** 履歴の選択をすべて解除する */
  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  /** 選択中の履歴エントリを削除する */
  const deleteSelected = () => {
    if (selectedIds.size === 0) return
    const next = history.filter((e) => !selectedIds.has(e.id))
    saveHistory(next)
    setHistory(next)
    setSelectedIds(new Set())
  }

  /** 履歴をすべて削除する */
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
            <Label htmlFor="issue-name">課題名</Label>
            <Input
              id="issue-name"
              placeholder="ログイン画面のバグ修正"
              value={issueName}
              onChange={(e) => setIssueName(e.target.value)}
            />
          </div>
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
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={!canGenerate}>
            生成
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={!hasFormContent}
          >
            リセット
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {(branchDev || branchStg) && (
          <div className="space-y-3 rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
            <p className="text-sm font-medium text-foreground">生成結果</p>
            <div className="space-y-2">
              {issueName.trim() && (
                <CopyableRow
                  text={issueName.trim()}
                  onCopy={copyText}
                  copyLabel="課題名をコピー"
                />
              )}
              {branchDev && (
                <CopyableRow
                  label="dev"
                  text={branchDev}
                  mono
                  onCopy={copyText}
                  copyLabel="dev ブランチ名をコピー"
                />
              )}
              {branchStg && (
                <CopyableRow
                  label="stg"
                  text={branchStg}
                  mono
                  onCopy={copyText}
                  copyLabel="stg ブランチ名をコピー"
                />
              )}
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
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex min-w-0 items-start gap-1">
                        <Label
                          htmlFor={`hist-${entry.id}`}
                          className="min-w-0 flex-1 font-medium text-foreground cursor-pointer break-words"
                        >
                          {entry.issueName || '（課題名なし）'}
                        </Label>
                        {entry.issueName && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => copyText(entry.issueName)}
                            aria-label="課題名をコピー"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <CopyableRow
                        label="dev"
                        text={entry.branchDev}
                        mono
                        onCopy={copyText}
                        copyLabel="dev ブランチ名をコピー"
                      />
                      <CopyableRow
                        label="stg"
                        text={entry.branchStg}
                        mono
                        onCopy={copyText}
                        copyLabel="stg ブランチ名をコピー"
                      />
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
