import { GoogleAuthProvider } from '@/contexts/GoogleAuthContext'
import { AppTabs } from '@/components/AppTabs'

function App() {
  return (
    <GoogleAuthProvider>
      <div className="min-h-screen">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto max-w-3xl px-4 py-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-sm shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #b22234 0%, #1b3a6b 50%, #e8b4b8 100%)',
                }}
              >
                WT
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Work Tools
                </h1>
                <p className="text-xs text-muted-foreground">
                  エンジニア向け便利ツール集
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-3xl px-4 py-6">
          <AppTabs />
        </main>

        <footer className="border-t mt-8">
          <div className="container mx-auto max-w-3xl px-4 py-4 text-center text-xs text-muted-foreground">
            NISHIKIGOI-inspired UI · workTools-01
          </div>
        </footer>
      </div>
    </GoogleAuthProvider>
  )
}

export default App
