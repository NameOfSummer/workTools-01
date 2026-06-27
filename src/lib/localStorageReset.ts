const STORAGE_KEYS = [
  'worktools-tab-order',
  'worktools-branch-form',
  'worktools-branch-history',
] as const

export function resetAllLocalStorage(): void {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

export function getStorageKeyLabels(): { key: string; label: string }[] {
  return [
    { key: 'worktools-tab-order', label: 'タブの並び順' },
    { key: 'worktools-branch-form', label: 'ブランチ名の入力内容' },
    { key: 'worktools-branch-history', label: 'ブランチ名の生成履歴' },
  ]
}
