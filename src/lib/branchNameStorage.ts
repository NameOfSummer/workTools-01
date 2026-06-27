/** ブランチ名フォーム入力の localStorage キー */
const FORM_KEY = 'worktools-branch-form'

/** ブランチ名生成履歴の localStorage キー */
const HISTORY_KEY = 'worktools-branch-history'

/** ブランチ名生成フォームの入力値 */
export interface BranchFormInputs {
  jiraCode: string
  taskNumber: string
  issueName: string
}

/** 生成履歴の1件分 */
export interface BranchHistoryEntry {
  id: string
  jiraCode: string
  taskNumber: string
  issueName: string
  branchDev: string
  branchStg: string
  createdAt: number
}

/**
 * dev / stg 用のブランチ名文字列を組み立てる
 * 形式: feature/SP-{jiraCode}/{taskNumber}/{env}
 */
export function buildBranchName(
  jiraCode: string,
  taskNumber: string,
  env: 'dev' | 'stg'
): string {
  return `feature/SP-${jiraCode.trim()}/${taskNumber.trim()}/${env}`
}

/** localStorage からフォーム入力を読み込む — 失敗時は空文字で返す */
export function loadFormInputs(): BranchFormInputs {
  try {
    const raw = localStorage.getItem(FORM_KEY)
    if (!raw) return { jiraCode: '', taskNumber: '', issueName: '' }
    const parsed = JSON.parse(raw) as BranchFormInputs
    return {
      jiraCode: parsed.jiraCode ?? '',
      taskNumber: parsed.taskNumber ?? '',
      issueName: parsed.issueName ?? '',
    }
  } catch {
    return { jiraCode: '', taskNumber: '', issueName: '' }
  }
}

/** フォーム入力を localStorage に保存する */
export function saveFormInputs(inputs: BranchFormInputs): void {
  localStorage.setItem(FORM_KEY, JSON.stringify(inputs))
}

/** 生成履歴を localStorage から読み込む */
export function loadHistory(): BranchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BranchHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** 生成履歴を localStorage に保存する */
export function saveHistory(entries: BranchHistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

/**
 * 履歴の先頭に新しいエントリを追加して保存する
 */
export function addHistoryEntry(
  inputs: BranchFormInputs,
  branchDev: string,
  branchStg: string
): BranchHistoryEntry {
  const entry: BranchHistoryEntry = {
    id: crypto.randomUUID(),
    jiraCode: inputs.jiraCode.trim(),
    taskNumber: inputs.taskNumber.trim(),
    issueName: inputs.issueName.trim(),
    branchDev,
    branchStg,
    createdAt: Date.now(),
  }
  const history = loadHistory()
  history.unshift(entry)
  saveHistory(history)
  return entry
}
