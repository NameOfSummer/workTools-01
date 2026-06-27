import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getStorageKeyLabels, resetAllLocalStorage } from '@/lib/localStorageReset'

export function SettingsDialog() {
  const handleReset = () => {
    resetAllLocalStorage()
    window.location.reload()
  }

  const labels = getStorageKeyLabels()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-[#4a4a4a] hover:bg-secondary-hover hover:text-[#4a4a4a]"
          aria-label="設定"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            ローカルストレージに保存されたデータを管理します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">保存されているデータ</p>
          <ul className="space-y-1 text-muted-foreground">
            {labels.map(({ label }) => (
              <li key={label}>・{label}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            リセットするとタブの並び順・ブランチ名の入力・履歴が初期状態に戻ります。
          </p>
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={handleReset}>
            ローカルストレージをリセット
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
