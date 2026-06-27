import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Delete } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LogoMark } from '@/components/LogoMark'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

/** PIN の桁数 */
const PIN_LENGTH = 4

/** テンキーボタン共通の Tailwind クラス (狭い画面でもはみ出さない) */
const KEYPAD_BUTTON_CLASS =
  'h-10 w-full min-w-0 max-w-full px-0 py-0 text-base min-[400px]:h-12 min-[400px]:text-lg'

/** 入力値から数字のみを取り出し、最大桁数に切り詰める */
function normalizePinInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PIN_LENGTH)
}

/** PIN 入力状態を丸ドットで表示する */
function PinDots({ length }: { length: number }) {
  return (
    <div className="flex justify-center gap-2 min-[400px]:gap-3" aria-hidden="true">
      {Array.from({ length: PIN_LENGTH }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2.5 w-2.5 rounded-full border-2 min-[400px]:h-3 min-[400px]:w-3',
            i < length
              ? 'border-primary bg-primary'
              : 'border-border bg-card'
          )}
        />
      ))}
    </div>
  )
}

/** 4桁 PIN 入力用のテンキー UI */
function PinKeypad({
  pinLength,
  onDigit,
  onBackspace,
}: {
  pinLength: number
  onDigit: (digit: string) => void
  onBackspace: () => void
}) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  const digitsDisabled = pinLength >= PIN_LENGTH

  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-3 gap-1 min-[400px]:gap-2">
      {digits.map((digit) => (
        <Button
          key={digit}
          type="button"
          variant="outline"
          disabled={digitsDisabled}
          className={KEYPAD_BUTTON_CLASS}
          onClick={() => onDigit(digit)}
        >
          {digit}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={pinLength === 0}
        className={KEYPAD_BUTTON_CLASS}
        onClick={onBackspace}
        aria-label="1文字削除"
      >
        <Delete className="h-4 w-4 min-[400px]:h-5 min-[400px]:w-5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={digitsDisabled}
        className={cn(KEYPAD_BUTTON_CLASS, 'col-start-2')}
        onClick={() => onDigit('0')}
      >
        0
      </Button>
    </div>
  )
}

/**
 * PIN 認証ゲート
 * 未認証時は全画面の PIN 入力画面を表示し、認証後に子要素を描画する
 */
export function PinGate({ children }: { children: ReactNode }) {
  const { authed, pinRequired, login } = useAuth()
  const screenRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pin, setPin] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 横スクロールずれを防ぐため表示直後にスクロール位置をリセット
  useLayoutEffect(() => {
    screenRef.current?.scrollTo(0, 0)
    inputRef.current?.focus()
  })

  if (!pinRequired || authed) {
    return children
  }

  const appendDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return
    setError(null)
    setPin((prev) => normalizePinInput(prev + digit))
  }

  const backspace = () => {
    setError(null)
    setPin((prev) => prev.slice(0, -1))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (login(pin, remember)) {
      setError(null)
      setPin('')
      return
    }
    setError('PINが正しくありません')
    setPin('')
  }

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-50 box-border flex items-center justify-center overflow-x-clip overflow-y-auto bg-background p-2 min-[400px]:p-3"
    >
      <Card className="box-border w-full max-w-sm min-w-0 shrink-0">
        <CardHeader className="items-center space-y-1 p-3 text-center min-[400px]:space-y-1.5 min-[400px]:p-4 min-[400px]:pb-2">
          <LogoMark className="h-9 w-9 min-[400px]:mb-2 min-[400px]:h-12 min-[400px]:w-12" />
          <CardTitle className="text-base min-[400px]:text-lg">Work Tools</CardTitle>
          <CardDescription className="text-xs leading-snug min-[400px]:text-sm">
            4桁のPINを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 min-[400px]:p-4 min-[400px]:pt-0">
          <form className="min-w-0 space-y-3 min-[400px]:space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 min-[400px]:space-y-3">
              <Label htmlFor="app-pin" className="sr-only">
                PIN（4桁）
              </Label>
              <PinDots length={pin.length} />
              {/* hidden: レイアウトに影響させずキーボード入力用に保持 */}
              <input
                ref={inputRef}
                id="app-pin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={PIN_LENGTH}
                value={pin}
                onChange={(e) => {
                  setError(null)
                  setPin(normalizePinInput(e.target.value))
                }}
                autoComplete="one-time-code"
                hidden
                tabIndex={-1}
              />
            </div>

            <PinKeypad
              pinLength={pin.length}
              onDigit={appendDigit}
              onBackspace={backspace}
            />

            <div className="flex min-w-0 items-start gap-2">
              <Checkbox
                id="app-remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
                className="mt-0.5 shrink-0"
              />
              <Label
                htmlFor="app-remember"
                className="min-w-0 flex-1 cursor-pointer text-xs font-normal leading-snug text-foreground min-[400px]:text-sm"
              >
                ログイン状態を保持
              </Label>
            </div>
            {error && (
              <p className="text-xs text-destructive min-[400px]:text-sm">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full min-w-0 max-w-full"
              disabled={pin.length !== PIN_LENGTH}
            >
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
