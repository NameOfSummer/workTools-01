import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Pipette, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pixelToColor, type RgbColor } from '@/lib/colorUtils'
import { useCopy } from '@/contexts/CopyContext'
import { cn } from '@/lib/utils'

const MAX_CANVAS_WIDTH = 640

function isTabPanelVisible(el: HTMLElement | null): boolean {
  const panel = el?.closest('[role="tabpanel"]')
  return panel instanceof HTMLElement && !panel.hidden
}

export function ImageColorPicker() {
  const { copy } = useCopy()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [picked, setPicked] = useState<RgbColor | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImageFromFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setPicked(null)
      setError(null)
    }
    reader.onerror = () => {
      setError('画像の読み込みに失敗しました')
    }
    reader.readAsDataURL(file)
  }, [])

  const drawImageToCanvas = useCallback(() => {
    if (!imageSrc || !canvasRef.current || !containerRef.current) return

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const maxWidth = Math.min(container.clientWidth, MAX_CANVAS_WIDTH)
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = Math.max(1, Math.floor(img.width * scale))
      canvas.height = Math.max(1, Math.floor(img.height * scale))

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    drawImageToCanvas()
  }, [drawImageToCanvas])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!isTabPanelVisible(containerRef.current)) return

      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) loadImageFromFile(file)
          return
        }
      }
    }

    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [loadImageFromFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadImageFromFile(file)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadImageFromFile(file)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)))
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)))

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setPicked(pixelToColor(r, g, b))
  }

  const clearImage = () => {
    setImageSrc(null)
    setPicked(null)
    setError(null)
  }

  const copyText = (text: string) => {
    if (text) copy(text)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>画像カラーピッカー</CardTitle>
        <CardDescription>
          画像を貼り付けまたはドラッグ&ドロップし、クリックで色を取得
        </CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="space-y-4 min-w-0">
        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex min-w-0 flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed p-6 text-center transition-colors min-[400px]:p-8',
              isDragOver
                ? 'border-primary bg-accent'
                : 'border-border bg-accent/50'
            )}
          >
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>画像をドラッグ&ドロップ</p>
              <p className="text-xs">または Ctrl+V / Cmd+V で貼り付け</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              ファイルを選択
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Pipette className="h-4 w-4" />
                画像をクリックして色を取得
              </p>
              <Button variant="outline" size="sm" onClick={clearImage}>
                <X className="h-4 w-4" />
                画像をクリア
              </Button>
            </div>
            <div
              className="min-w-0 overflow-hidden rounded-sm border border-border bg-card"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto cursor-crosshair touch-none"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {picked && (
          <div className="space-y-3 rounded-sm border border-border bg-accent p-3 min-[400px]:p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-12 w-12 shrink-0 rounded-sm border border-border shadow-sm"
                style={{ backgroundColor: picked.hex }}
                aria-hidden="true"
              />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">取得した色</p>
                <p className="text-xs font-mono break-all">{picked.hex}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => copyText(picked.hex)}
              >
                HEX コピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => copyText(picked.rgb)}
              >
                RGB コピー
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
