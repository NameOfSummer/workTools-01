export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function formatRgb(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`
}

export interface RgbColor {
  r: number
  g: number
  b: number
  hex: string
  rgb: string
}

export function pixelToColor(r: number, g: number, b: number): RgbColor {
  return { r, g, b, hex: rgbToHex(r, g, b), rgb: formatRgb(r, g, b) }
}
