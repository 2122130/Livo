// 画面IDの定義。アクセスログのscreen_id記録や画面識別に使う。
// 画面やログ記録処理に 'lv100' のような値を直書きせず、必ずこの定数を参照する。
export const SCREEN = {
  MAIN_MENU:       'lv010',   // メインメニュー
  BUKKEN_RENTAL:   'lv100',   // 物件一覧 - 賃貸タブ
  RENTAL_NEW:      'lv101',   // 賃貸物件登録
  ROOM_LIST:       'lv110',   // 賃貸部屋一覧
  ROOM_NEW:        'lv111',   // 賃貸部屋登録
  ROOM_EDIT:       'lv111',   // 賃貸部屋編集
  ROOM_DETAIL:     'lv112',   // 賃貸部屋詳細
  BUKKEN_SALE:     'lv200',   // 物件一覧 - 売買タブ
  SALE_NEW:        'lv201',   // 売買物件登録
  SALE_EDIT:       'lv201',   // 売買物件編集
  SALE_DETAIL:     'lv202',   // 売買物件詳細
  BUKKEN_SOLAR:    'lv300',   // 物件一覧 - 太陽光タブ(要件確定後)
  VACANCY:         'lv700',   // 空室管理
  INQUIRY_LIST:    'lv800',   // 対応履歴一覧
  INQUIRY_NEW:     'lv801',   // 対応履歴登録
  INQUIRY_EDIT:    'lv801',   // 対応履歴編集
  SETTINGS:        'lv900',   // 設定
  ACCOUNTS:        'lv910',   // アカウント管理
  ACCESS_LOGS:     'lv920',   // アクセスログ
} as const

export type ScreenId = typeof SCREEN[keyof typeof SCREEN]

// 画面ID→画面名(ログ閲覧画面などでの表示用)
export const SCREEN_NAME: Record<string, string> = {
  lv010: 'メインメニュー',
  lv100: '物件一覧 - 賃貸',
  lv101: '賃貸物件登録',
  lv110: '賃貸部屋一覧',
  lv111: '賃貸部屋登録',
  lv112: '賃貸部屋詳細',
  lv200: '物件一覧 - 売買',
  lv201: '売買物件登録',
  lv202: '売買物件詳細',
  lv300: '物件一覧 - 太陽光',
  lv700: '空室管理',
  lv800: '対応履歴一覧',
  lv801: '対応履歴登録',
  lv900: '設定',
  lv910: 'アカウント管理',
  lv920: 'アクセスログ',
}