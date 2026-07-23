import { createClient } from '@/lib/supabase/server'

export async function getSaleBukkenList() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('m300_sale_bukken')
    .select(`
      bukken_id, bukken_category, bukken_name, trade_status, management_type, price, address, transaction_type,
      m301_sale_bukken_mansion(floor_plan, exclusive_area),
      m302_sale_bukken_apartment(yield_rate, total_floor_area, land_area),
      m303_sale_bukken_house(floor_plan, total_floor_area, land_area),
      m304_sale_bukken_land(land_area, current_status)
    `)
    .eq('mukou_kbn', 0)
    .order('create_date', { ascending: false })
  if (error) throw error

  // ネストした詳細を平坦化(該当種別の詳細だけ detail にまとめる)
  return (data ?? []).map((r) => {
    const detail =
      (r.m301_sale_bukken_mansion as unknown) ||
      (r.m302_sale_bukken_apartment as unknown) ||
      (r.m303_sale_bukken_house as unknown) ||
      (r.m304_sale_bukken_land as unknown) ||
      {}
    return {
      bukken_id: r.bukken_id,
      bukken_category: r.bukken_category,
      bukken_name: r.bukken_name,
      trade_status: r.trade_status,
      management_type: r.management_type,
      price: r.price,
      address: r.address,
      transaction_type: r.transaction_type,
      detail: detail as Record<string, unknown>,
    }
  })
}

// 種別コード → 詳細テーブル名
const DETAIL_TABLE: Record<number, string> = {
  1: 'm301_sale_bukken_mansion',
  2: 'm302_sale_bukken_apartment',
  3: 'm303_sale_bukken_house',
  4: 'm304_sale_bukken_land',
}

export async function getSaleBukkenDetail(bukkenId: string) {
  const supabase = await createClient()

  // 共通項目
  const { data: base, error } = await supabase
    .from('m300_sale_bukken')
    .select('bukken_id, bukken_category, bukken_name, trade_status, management_type, price, address, transaction_type')
    .eq('bukken_id', bukkenId)
    .eq('mukou_kbn', 0)
    .single()
  if (error) throw error

  // 種別詳細
  const detailTable = DETAIL_TABLE[base.bukken_category]
  const { data: detail } = await supabase
    .from(detailTable)
    .select('*')
    .eq('bukken_id', bukkenId)
    .maybeSingle()

  return { ...base, detail: detail ?? {} }
}