import {
  BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL, TRADE_STATUS_LABEL,
  TRANSACTION_TYPE_LABEL, LAND_STATUS_LABEL, TAIOU_KBN_LABEL,
  TAIOU_STATUS_LABEL, BUKKEN_KBN_LABEL,
} from './kbn'

// 変更履歴で「何が変わったか」を表示するときの列名 → 日本語名
export const COLUMN_LABEL: Record<string, string> = {
  bukken_name: '物件名',
  bukken_category: '種別',
  management_type: '管理区分',
  address: '所在地',
  room_number: '部屋番号',
  layout: '間取り',
  rent: '賃料',
  other_fee: 'その他費用',
  parking_number: '駐車場番号',
  guarantee_company: '保証会社',
  tenant_name: '入居者名',
  move_in_date: '入居日',
  move_out_date: '退去日',
  trade_status: '状態',
  price: '価格',
  transaction_type: '取引態様',
  floor_plan: '間取り',
  exclusive_area: '専有面積',
  yield_rate: '利回り',
  total_floor_area: '延床面積',
  land_area: '土地面積',
  current_status: '現況',
  bukken_kbn: '物件区分',
  taiou_kbn: '対応区分',
  status_kbn: '進捗',
  uketsuke_date: '受付日',
  customer_name: 'お客様名',
  customer_tel: 'お客様電話番号',
  title: '件名',
  content: '対応内容',
  bikou: '備考',
  uketsuke_account_id: '受付者',
  tantou_account_id: '担当者',
  mukou_kbn: '削除',
}

// 区分値は数字ではなく名前で見せる
export const COLUMN_VALUE_LABEL: Record<string, Record<number, string>> = {
  bukken_category: BUKKEN_CATEGORY_LABEL,
  management_type: MANAGEMENT_TYPE_LABEL,
  trade_status: TRADE_STATUS_LABEL,
  transaction_type: TRANSACTION_TYPE_LABEL,
  current_status: LAND_STATUS_LABEL,
  taiou_kbn: TAIOU_KBN_LABEL,
  status_kbn: TAIOU_STATUS_LABEL,
  bukken_kbn: BUKKEN_KBN_LABEL,
  mukou_kbn: { 0: 'なし', 1: '削除済み' },
}

// 履歴の比較から外す列(仕組み上の列)
export const IGNORE_COLUMNS = new Set([
  'org_id', 'bukken_id', 'room_id', 'tenancy_id', 'taiou_id',
  'create_date', 'create_account', 'update_date', 'update_account',
  'update_at', 'updated_at', 'created_at',
])

export const TABLE_LABEL: Record<string, string> = {
  m200_rent_bukken: '物件',
  m210_rent_room: '部屋',
  t250_rent_room_tenancy: '入居',
  m300_sale_bukken: '物件',
  m301_sale_bukken_mansion: '詳細',
  m302_sale_bukken_apartment: '詳細',
  m303_sale_bukken_house: '詳細',
  m304_sale_bukken_land: '詳細',
  t500_taiou_rireki: '対応',
}
