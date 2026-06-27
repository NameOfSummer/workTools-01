import { Clock, Braces, Shuffle, Settings as SettingsIcon, Timer } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JsonFormatter } from '@/components/JsonFormatter'
import { RandomStringGenerator } from '@/components/RandomStringGenerator'
import { UnixTimeTool } from '@/components/UnixTimeTool'
import { Stopwatch } from '@/components/Stopwatch'
import { Settings } from '@/components/Settings'

export function AppTabs() {
  return (
    <Tabs defaultValue="stopwatch" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto gap-1 p-1">
        <TabsTrigger value="stopwatch" className="gap-1.5 py-2">
          <Timer className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">ストップウォッチ</span>
          <span className="sm:hidden">計測</span>
        </TabsTrigger>
        <TabsTrigger value="json" className="gap-1.5 py-2">
          <Braces className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">JSON</span>
          <span className="sm:hidden">JSON</span>
        </TabsTrigger>
        <TabsTrigger value="random" className="gap-1.5 py-2">
          <Shuffle className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">ランダム</span>
          <span className="sm:hidden">乱数</span>
        </TabsTrigger>
        <TabsTrigger value="unix" className="gap-1.5 py-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">UNIX時間</span>
          <span className="sm:hidden">時間</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-1.5 py-2">
          <SettingsIcon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">設定</span>
          <span className="sm:hidden">設定</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stopwatch">
        <Stopwatch />
      </TabsContent>
      <TabsContent value="json">
        <JsonFormatter />
      </TabsContent>
      <TabsContent value="random">
        <RandomStringGenerator />
      </TabsContent>
      <TabsContent value="unix">
        <UnixTimeTool />
      </TabsContent>
      <TabsContent value="settings">
        <Settings />
      </TabsContent>
    </Tabs>
  )
}
