/** ケース変換の種類 */
export type CaseStyle =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'screamingSnake'
  | 'kebab'
  | 'lower'
  | 'upper'
  | 'title'

/** UI 表示用のケース名ラベル */
export const CASE_STYLE_LABELS: Record<CaseStyle, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  screamingSnake: 'SCREAMING_SNAKE',
  kebab: 'kebab-case',
  lower: 'lower case',
  upper: 'UPPER CASE',
  title: 'Title Case',
}

/**
 * 入力文字列を単語配列に分割する
 * camelCase / snake_case / スペース区切りなどに対応
 */
export function wordsFromString(input: string): string[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  return trimmed
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean)
}

/**
 * 指定したケース形式に変換する
 */
export function convertCase(input: string, style: CaseStyle): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  const words = wordsFromString(trimmed)
  if (words.length === 0) return ''

  switch (style) {
    case 'camel':
      return (
        words[0] +
        words
          .slice(1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join('')
      )
    case 'pascal':
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
    case 'snake':
      return words.join('_')
    case 'screamingSnake':
      return words.join('_').toUpperCase()
    case 'kebab':
      return words.join('-')
    case 'lower':
      return words.join(' ')
    case 'upper':
      return words.join(' ').toUpperCase()
    case 'title':
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
  }
}

/** 全ケース形式への変換結果をまとめて返す */
export function convertAllCases(input: string): Record<CaseStyle, string> {
  const styles: CaseStyle[] = [
    'camel',
    'pascal',
    'snake',
    'screamingSnake',
    'kebab',
    'lower',
    'upper',
    'title',
  ]
  return Object.fromEntries(
    styles.map((style) => [style, convertCase(input, style)])
  ) as Record<CaseStyle, string>
}
