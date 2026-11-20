import { createClient } from '@/lib/supabase/server'
import { getRoomDetail, getRentalBukken } from '@/features/queries/rental'
import { getCustomFields } from '@/features/queries/custom-fields'
import { getMyOrgName } from '@/features/queries/org'
import { formatCustomValue, type CustomValues } from '@/lib/custom-fields'

// 契約書(頭書)を作るためのデータをまとめて取る
export async function getContractData(roomId: string, tenancyId?: string) {
  const supabase = await createClient()
  const room = await getRoomDetail(roomId)

  const [bukken, roomFields, rentalFields, orgName] = await Promise.all([
    getRentalBukken(room.bukken_id),
    getCustomFields('room'),
    getCustomFields('rental'),
    getMyOrgName(),
  ])

  // 対象の入居: 指定があればそれ、無ければ入居中、それも無ければ最新
  let q = supabase
    .from('t250_rent_room_tenancy')
    .select('tenancy_id, tenant_name, move_in_date, move_out_date, bikou')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
  if (tenancyId) q = q.eq('tenancy_id', tenancyId)
  const { data: tenancies } = await q.order('move_in_date', { ascending: false })
  const tenancy =
    (tenancies ?? []).find((t) => t.move_out_date === null) ?? (tenancies ?? [])[0] ?? null

  // 追加項目は「項目名」で引けるようにする(部屋 → 物件 の順に探す)
  const norm = (s: string) => s.replace(/[\s　()（）・:：]/g, '')
  const byLabel = new Map<string, string>()
  const put = (fields: typeof roomFields, values: CustomValues | null | undefined) => {
    for (const f of fields) {
      const v = formatCustomValue(f, values?.[f.field_id])
      if (v !== null && !byLabel.has(norm(f.label))) byLabel.set(norm(f.label), v)
    }
  }
  put(roomFields, room.custom_fields as CustomValues)
  put(rentalFields, bukken.custom_fields as CustomValues)

  // 候補の項目名のどれかに当てはまる値を返す
  const cf = (...labels: string[]): string | null => {
    for (const l of labels) {
      const v = byLabel.get(norm(l))
      if (v) return v
    }
    return null
  }

  return { room, bukken, tenancy, orgName, cf }
}

// 2026-09-01 → 令和8年9月1日
export function wareki(date?: string | null): string | null {
  if (!date) return null
  const d = new Date(`${date}T00:00:00+09:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('ja-JP-u-ca-japanese', {
    timeZone: 'Asia/Tokyo', era: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export const yen = (v: number | string | null | undefined): string | null => {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,円]/g, ''))
  return Number.isFinite(n) ? `${n.toLocaleString()}円` : String(v)
}

// 書きかけの契約書(保存してあれば)
export async function getContractDraft(roomId: string, tenancyKey: string, sheetType: 'house' | 'store') {
  const supabase = await createClient()
  const { data } = await supabase
    .from('t600_contract_draft')
    .select('values, layout_version, update_date, update_account')
    .eq('room_id', roomId)
    .eq('tenancy_key', tenancyKey)
    .eq('sheet_type', sheetType)
    .maybeSingle()
  return data as
    | { values: { e: string[]; c: boolean[] }; layout_version: string; update_date: string; update_account: string | null }
    | null
}

// 用紙の形を変えたら上げる(古い保存内容を間違った欄に戻さないため)
export const CONTRACT_LAYOUT_VERSION = { house: 'house-v1', store: 'store-v1' } as const
