import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind クラス名を結合し、競合するユーティリティをマージする
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
