/** 設定画面のリセット対象となる localStorage キー一覧 */
const STORAGE_KEYS = [
  'worktools-tab-order',
  'worktools-tab-visibility',
  'worktools-branch-form',
  'worktools-branch-history',
  'worktools-auth-persist',
] as const

/** 登録済みの localStorage キーをすべて削除する */
export function resetAllLocalStorage(): void {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

/** 設定画面に表示するキーと説明ラベルの一覧 */
export function getStorageKeyLabels(): { key: string; label: string }[] {
  return [
    { key: 'worktools-tab-order', label: 'タブの並び順' },
    { key: 'worktools-tab-visibility', label: 'タブの表示設定' },
    { key: 'worktools-branch-form', label: 'ブランチ名の入力内容' },
    { key: 'worktools-branch-history', label: 'ブランチ名の生成履歴' },
    { key: 'worktools-auth-persist', label: 'ログイン状態の保持' },
  ]
}
