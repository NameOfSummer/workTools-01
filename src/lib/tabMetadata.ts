import type { TabId } from '@/lib/tabOrderStorage'

/**
 * 各タブの表示名
 * label: 通常幅での表示、labelShort: 中間幅での省略表示
 */
export const TAB_METADATA: Record<TabId, { label: string; labelShort: string }> = {
  stopwatch: { label: 'ストップウォッチ', labelShort: '計測' },
  branch: { label: 'ブランチ', labelShort: 'Branch' },
  json: { label: 'JSON', labelShort: 'JSON' },
  sql: { label: 'SQL', labelShort: 'SQL' },
  case: { label: 'ケース変換', labelShort: 'Case' },
  random: { label: 'ランダム', labelShort: '乱数' },
  unix: { label: 'UNIX時間', labelShort: '時間' },
  color: { label: 'カラーピッカー', labelShort: '色' },
  regex: { label: '正規表現', labelShort: '正規' },
  diff: { label: 'diff', labelShort: 'diff' },
}
