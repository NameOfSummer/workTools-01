import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTabSettings } from '@/contexts/TabSettingsContext'
import { clearAuthSession, useAuth } from '@/contexts/AuthContext'
import { TAB_METADATA } from '@/lib/tabMetadata'
import { getStorageKeyLabels, resetAllLocalStorage } from '@/lib/localStorageReset'
import { loadTabOrder } from '@/lib/tabOrderStorage'

/** ヘッダーの設定ダイアログ (タブ表示切替・ログアウト・ストレージリセット) */
export function SettingsDialog() {
  const { visibility, setTabVisible, isLastVisibleTab } = useTabSettings()
  const { pinRequired, logout } = useAuth()
  const tabOrder = loadTabOrder()

  /** 全 localStorage データと認証状態を消去してリロードする */
  const handleReset = () => {
    clearAuthSession()
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
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-lg overflow-y-auto min-[400px]:w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            タブの表示やローカルストレージのデータを管理します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">タブの表示</p>
          <ul className="space-y-2">
            {tabOrder.map((id) => {
              const disabled = isLastVisibleTab(id)
              return (
                <li key={id} className="flex items-center gap-3">
                  <Checkbox
                    id={`tab-vis-${id}`}
                    checked={visibility[id]}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      setTabVisible(id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`tab-vis-${id}`}
                    className="cursor-pointer text-sm font-normal text-foreground"
                  >
                    {TAB_METADATA[id].label}
                  </Label>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-muted-foreground">
            非表示にしたタブは画面上に表示されません。最低1つは表示が必要です。
          </p>
        </div>

        <Separator />

        {pinRequired && (
          <>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">ログイン</p>
              <p className="text-xs text-muted-foreground">
                ログアウトするとPIN入力画面に戻ります。
              </p>
              <Button variant="outline" onClick={logout}>
                ログアウト
              </Button>
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">ローカルストレージのリセット</p>
          <ul className="space-y-1 text-muted-foreground">
            {labels.map(({ label }) => (
              <li key={label}>・{label}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            リセットするとタブの並び順・表示設定・ブランチ名の入力・履歴が初期状態に戻ります。ログイン状態の保持も解除されます。
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="destructive" className="w-full min-w-0 sm:w-auto" onClick={handleReset}>
            ローカルストレージをリセット
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
