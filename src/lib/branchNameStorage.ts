const FORM_KEY = 'worktools-branch-form'
const HISTORY_KEY = 'worktools-branch-history'

export interface BranchFormInputs {
  jiraCode: string
  taskNumber: string
  issueName: string
}

export interface BranchHistoryEntry {
  id: string
  jiraCode: string
  taskNumber: string
  issueName: string
  branchDev: string
  branchStg: string
  createdAt: number
}

export function buildBranchName(
  jiraCode: string,
  taskNumber: string,
  env: 'dev' | 'stg'
): string {
  return `feature/SP-${jiraCode.trim()}/${taskNumber.trim()}/${env}`
}

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

export function saveFormInputs(inputs: BranchFormInputs): void {
  localStorage.setItem(FORM_KEY, JSON.stringify(inputs))
}

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

export function saveHistory(entries: BranchHistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

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
