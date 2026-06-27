import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Clock,
  Braces,
  Shuffle,
  Timer,
  GitBranch,
  Pipette,
  Regex,
  FileDiff,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { JsonFormatter } from '@/components/JsonFormatter'
import { RandomStringGenerator } from '@/components/RandomStringGenerator'
import { UnixTimeTool } from '@/components/UnixTimeTool'
import { Stopwatch } from '@/components/Stopwatch'
import { BranchNameGenerator } from '@/components/BranchNameGenerator'
import { ImageColorPicker } from '@/components/ImageColorPicker'
import { RegexTester } from '@/components/RegexTester'
import { DiffViewer } from '@/components/DiffViewer'
import {
  loadTabOrder,
  saveTabOrder,
  type TabId,
} from '@/lib/tabOrderStorage'
import { cn } from '@/lib/utils'

interface TabConfig {
  icon: LucideIcon
  label: string
  labelShort: string
}

const TAB_CONFIG: Record<TabId, TabConfig> = {
  stopwatch: {
    icon: Timer,
    label: 'ストップウォッチ',
    labelShort: '計測',
  },
  branch: {
    icon: GitBranch,
    label: 'ブランチ',
    labelShort: 'Branch',
  },
  json: {
    icon: Braces,
    label: 'JSON',
    labelShort: 'JSON',
  },
  random: {
    icon: Shuffle,
    label: 'ランダム',
    labelShort: '乱数',
  },
  unix: {
    icon: Clock,
    label: 'UNIX時間',
    labelShort: '時間',
  },
  color: {
    icon: Pipette,
    label: 'カラーピッカー',
    labelShort: '色',
  },
  regex: {
    icon: Regex,
    label: '正規表現',
    labelShort: '正規',
  },
  diff: {
    icon: FileDiff,
    label: 'diff',
    labelShort: 'diff',
  },
}

const TAB_CONTENT: Record<TabId, ReactNode> = {
  stopwatch: <Stopwatch />,
  branch: <BranchNameGenerator />,
  json: <JsonFormatter />,
  random: <RandomStringGenerator />,
  unix: <UnixTimeTool />,
  color: <ImageColorPicker />,
  regex: <RegexTester />,
  diff: <DiffViewer />,
}

function useTabLabelMode() {
  const [iconOnly, setIconOnly] = useState(false)
  const [shortLabel, setShortLabel] = useState(false)
  const [fullLabel, setFullLabel] = useState(false)

  useEffect(() => {
    const mqIcon = window.matchMedia('(max-width: 399px)')
    const mqShort = window.matchMedia('(min-width: 400px) and (max-width: 639px)')
    const mqFull = window.matchMedia('(min-width: 640px)')

    const update = () => {
      setIconOnly(mqIcon.matches)
      setShortLabel(mqShort.matches)
      setFullLabel(mqFull.matches)
    }

    update()
    mqIcon.addEventListener('change', update)
    mqShort.addEventListener('change', update)
    mqFull.addEventListener('change', update)

    return () => {
      mqIcon.removeEventListener('change', update)
      mqShort.removeEventListener('change', update)
      mqFull.removeEventListener('change', update)
    }
  }, [])

  return { iconOnly, shortLabel, fullLabel }
}

interface TabTriggerItemProps {
  id: TabId
  icon: LucideIcon
  label: string
  labelShort: string
  draggedId: TabId | null
  dragOverId: TabId | null
  onDragStart: (id: TabId, e: React.DragEvent) => void
  onDragOver: (id: TabId, e: React.DragEvent) => void
  onDrop: (id: TabId, e: React.DragEvent) => void
  onDragEnd: () => void
  iconOnly: boolean
  shortLabel: boolean
  fullLabel: boolean
}

function TabTriggerItem({
  id,
  icon: Icon,
  label,
  labelShort,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  iconOnly,
  shortLabel,
  fullLabel,
}: TabTriggerItemProps) {
  const fullLabelRef = useRef<HTMLSpanElement>(null)
  const shortLabelRef = useRef<HTMLSpanElement>(null)
  const [fullTruncated, setFullTruncated] = useState(false)
  const [shortTruncated, setShortTruncated] = useState(false)

  const checkTruncation = useCallback(() => {
    const fullEl = fullLabelRef.current
    const shortEl = shortLabelRef.current
    setFullTruncated(fullEl ? fullEl.scrollWidth > fullEl.clientWidth : false)
    setShortTruncated(shortEl ? shortEl.scrollWidth > shortEl.clientWidth : false)
  }, [])

  useEffect(() => {
    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [checkTruncation, label, labelShort, iconOnly, shortLabel, fullLabel])

  const showTooltip =
    iconOnly ||
    (fullLabel && fullTruncated) ||
    (shortLabel && (shortTruncated || labelShort !== label))

  const tabContent = (
    <span
      className={cn(
        'inline-flex min-w-0 w-full flex-1 items-center justify-center',
        'gap-0 px-1 py-2 min-[400px]:gap-1 min-[400px]:px-2 min-[640px]:gap-1.5 min-[640px]:px-3'
      )}
      onMouseEnter={checkTruncation}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span ref={fullLabelRef} className="hidden truncate min-[640px]:inline">
        {label}
      </span>
      <span
        ref={shortLabelRef}
        className="hidden truncate min-[400px]:inline min-[640px]:hidden"
      >
        {labelShort}
      </span>
    </span>
  )

  return (
    <TabsTrigger
      value={id}
      draggable
      onDragStart={(e) => onDragStart(id, e)}
      onDragOver={(e) => onDragOver(id, e)}
      onDrop={(e) => onDrop(id, e)}
      onDragEnd={onDragEnd}
      className={cn(
        'min-w-0 flex-1 p-0 cursor-grab active:cursor-grabbing',
        draggedId === id && 'opacity-50',
        dragOverId === id &&
          draggedId !== id &&
          'ring-2 ring-primary ring-offset-0'
      )}
    >
      {showTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{tabContent}</TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      ) : (
        tabContent
      )}
    </TabsTrigger>
  )
}

export function AppTabs() {
  const [order, setOrder] = useState<TabId[]>(() => loadTabOrder())
  const [activeTab, setActiveTab] = useState<TabId>(() => loadTabOrder()[0])
  const [draggedId, setDraggedId] = useState<TabId | null>(null)
  const [dragOverId, setDragOverId] = useState<TabId | null>(null)
  const labelMode = useTabLabelMode()

  const reorder = (fromId: TabId, toId: TabId) => {
    if (fromId === toId) return
    const next = [...order]
    const fromIndex = next.indexOf(fromId)
    const toIndex = next.indexOf(toId)
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, fromId)
    setOrder(next)
    saveTabOrder(next)
  }

  const handleDragStart = (id: TabId, e: React.DragEvent) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (id: TabId, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  const handleDrop = (id: TabId, e: React.DragEvent) => {
    e.preventDefault()
    if (draggedId) reorder(draggedId, id)
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="w-full min-w-0"
      >
        <TabsList className="flex h-auto min-w-0 w-full gap-0.5 p-0.5 min-[400px]:gap-1 min-[400px]:p-1">
          {order.map((id) => {
            const { icon, label, labelShort } = TAB_CONFIG[id]
            return (
              <TabTriggerItem
                key={id}
                id={id}
                icon={icon}
                label={label}
                labelShort={labelShort}
                draggedId={draggedId}
                dragOverId={dragOverId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                iconOnly={labelMode.iconOnly}
                shortLabel={labelMode.shortLabel}
                fullLabel={labelMode.fullLabel}
              />
            )
          })}
        </TabsList>

        {order.map((id) => (
          <TabsContent key={id} value={id} className="min-w-0">
            {TAB_CONTENT[id]}
          </TabsContent>
        ))}
      </Tabs>
    </TooltipProvider>
  )
}
