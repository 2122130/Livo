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