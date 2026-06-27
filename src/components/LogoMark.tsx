import { cn } from '@/lib/utils'

const TILES = [
  '#de091d',
  '#f8f0e5',
  '#ffffff',
  '#f8f0e5',
  '#ffffff',
  '#de091d',
  '#ffffff',
  '#de091d',
  '#f8f0e5',
] as const

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-sm shadow-sm ring-1 ring-black/5',
        className
      )}
      aria-hidden="true"
    >
      {TILES.map((color, i) => (
        <div key={i} className="aspect-square" style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}
