import { AppTabs } from '@/components/AppTabs'
import { LogoMark } from '@/components/LogoMark'
import { SettingsDialog } from '@/components/SettingsDialog'
import { CopyProvider } from '@/contexts/CopyContext'

function App() {
  return (
    <CopyProvider>
      <div className="flex min-h-screen min-w-0 flex-col bg-background">
        <header className="border-b-2 border-primary bg-secondary">
          <div className="container mx-auto max-w-3xl min-w-0 px-3 py-4 min-[400px]:px-4 min-[400px]:py-5">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 min-[400px]:gap-3">
                <LogoMark className="h-9 w-9 min-[400px]:h-10 min-[400px]:w-10" />
                <div className="min-w-0">
                  <h1 className="text-lg font-bold tracking-wide text-[#4a4a4a] min-[400px]:text-xl">
                    Work Tools
                  </h1>
                </div>
              </div>
              <SettingsDialog />
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-3xl min-w-0 flex-1 px-3 py-4 min-[400px]:px-4 min-[400px]:py-6">
          <AppTabs />
        </main>

        <footer className="border-t border-border bg-secondary">
          <div className="container mx-auto max-w-3xl min-w-0 px-3 py-3 text-center text-xs tracking-wide text-muted-foreground min-[400px]:px-4 min-[400px]:py-4">
            <span className="break-words">NISHIKIGOI-inspired UI · workTools-01</span>
          </div>
        </footer>
      </div>
    </CopyProvider>
  )
}

export default App
