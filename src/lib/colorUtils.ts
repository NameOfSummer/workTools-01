/** RGB 各成分を HEX 文字列 (#rrggbb) に変換する */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** RGB 各成分を css rgb() 形式の文字列に変換する */
export function formatRgb(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`
}

/** 画像ピック結果として扱う色情報 */
export interface RgbColor {
  r: number
  g: number
  b: number
  hex: string
  rgb: string
}

/** ピクセル値から HEX / RGB 付きの色情報オブジェクトを作る */
export function pixelToColor(r: number, g: number, b: number): RgbColor {
  return { r, g, b, hex: rgbToHex(r, g, b), rgb: formatRgb(r, g, b) }
}
