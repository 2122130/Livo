import { Building2, DoorOpen, ClipboardList, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SCREEN } from './screens'

export type MenuItem = {
  screenId: string
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export const MAIN_MENU: MenuItem[] = [
  {
    screenId: SCREEN.BUKKEN_RENTAL, // 物件一覧の入口(既定タブ=賃貸)
    label: '物件一覧',
    href: '/bukken',
    icon: Building2,
    description: '賃貸・売買・太陽光の物件を管理',
  },
  {
    screenId: SCREEN.VACANCY,
    label: '空室管理',
    href: '/vacancy',
    icon: DoorOpen,
    description: '空室の部屋を横断して確認',
  },
  {
    screenId: SCREEN.INQUIRY_LIST,
    label: '対応履歴',
    href: '/inquiries',
    icon: ClipboardList,
    description: '契約相談・クレームの進捗管理',
  },
  {
    screenId: SCREEN.SETTINGS,
    label: '設定',
    href: '/settings',
    icon: Settings,
    description: 'アカウント・組織の設定',
  },
]