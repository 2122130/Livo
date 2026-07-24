// アカウント権限
export const ROLE = {
  SYSTEM: 'system',   // システム管理者(組織横断。全組織のアカウント作成・ログ閲覧)
  ADMIN: 'admin',     // 管理者(自組織の一般アカウント作成)
  MEMBER: 'member',   // 一般
} as const

export const ROLE_LABEL: Record<string, string> = {
  system: 'システム管理者',
  admin: '管理者',
  member: '一般',
}

// 物件種別
export const BUKKEN_CATEGORY = {
  MANSION: 1, APARTMENT: 2, HOUSE: 3, LAND: 4,
} as const
export const BUKKEN_CATEGORY_LABEL: Record<number, string> = {
  1: 'マンション', 2: 'アパート', 3: '戸建て', 4: '土地',
}

// 管理区分
export const MANAGEMENT_TYPE = { OWN: 1, MANAGED: 2 } as const
export const MANAGEMENT_TYPE_LABEL: Record<number, string> = {
  1: '自社', 2: '管理',
}

// 部屋の状態(v_rent_room_status から導出される値)
export const ROOM_STATUS = { VACANT: 1, OCCUPIED: 2, PREPARING: 3 } as const
export const ROOM_STATUS_LABEL: Record<number, string> = {
  1: '空室', 2: '入居中', 3: '準備中',
}

// 準備区分(準備履歴 t260)
export const PREP_KBN = { REPAIR: 1, CLEANING: 2, OTHER: 3 } as const
export const PREP_KBN_LABEL: Record<number, string> = {
  1: '修理', 2: '清掃', 3: 'その他',
}

// 取引状態(売買)
export const TRADE_STATUS = { RECRUITING: 1, SOLD: 2 } as const
export const TRADE_STATUS_LABEL: Record<number, string> = {
  1: '募集中', 2: '売却',
}

// 取引態様(売買)
export const TRANSACTION_TYPE_LABEL: Record<number, string> = {
  1: '自社', 2: '一般媒介', 3: '専属専任媒介',
}

// 土地の現況(売買・土地)
export const LAND_STATUS_LABEL: Record<number, string> = {
  1: '更地', 2: '建物あり',
}

// 対応区分(対応履歴)
export const TAIOU_KBN = { SOUDAN: 1, CLAIM: 2, OTHER: 3 } as const
export const TAIOU_KBN_LABEL: Record<number, string> = {
  1: '契約相談', 2: 'クレーム', 3: 'その他',
}

// 対応進捗
export const TAIOU_STATUS = { NOT_YET: 1, IN_PROGRESS: 2, DONE: 3 } as const
export const TAIOU_STATUS_LABEL: Record<number, string> = {
  1: '未対応', 2: '対応中', 3: '完了',
}

// 物件区分(対応履歴の対象)
export const BUKKEN_KBN = { RENTAL: 1, SALE: 2 } as const
export const BUKKEN_KBN_LABEL: Record<number, string> = {
  1: '賃貸', 2: '売買',
}