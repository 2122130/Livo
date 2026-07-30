import { Search, Key, MessageSquare, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SCREEN } from './screens'

export type MenuItem = {
  screenId: string
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export const MAIN_MENU = [
  {
    screenId: SCREEN.BUKKEN_RENTAL,
    label: '物件一覧',
    href: '/bukken',
    icon: Search,          // アイコンもモックのものに変更
    description: '賃貸・売買の物件を管理',
    panelClass: 'panel-bukken',
  },
  {
    screenId: SCREEN.VACANCY,
    label: '空室管理',
    href: '/vacancy',
    icon: Key,
    description: '空室の部屋を横断して確認',
    panelClass: 'panel-akiya',
  },
  {
    screenId: SCREEN.INQUIRY_LIST,
    label: '対応履歴',
    href: '/inquiries',
    icon: MessageSquare,
    description: '契約相談・クレームの進捗管理',
    panelClass: 'panel-taiou',
  },
  {
    screenId: SCREEN.SETTINGS,
    label: '設定',
    href: '/settings',
    icon: Settings,
    description: 'アカウント・組織の設定',
    panelClass: 'panel-keiyaku',
  },
]