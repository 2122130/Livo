import { createClient } from '@/lib/supabase/server'

export async function getTaiouRirekiList() {
  const supabase = await createClient()

  const { data: list, error } = await supabase
    .from('t500_taiou_rireki')
    // getTaiouRirekiList の select
    .select('taiou_id, bukken_kbn, bukken_id, room_id, taiou_kbn, status_kbn, uketsuke_date, customer_name, customer_tel, title, content, bikou, uketsuke_account_id, tantou_account_id')
    .eq('mukou_kbn', 0)
    .order('uketsuke_date', { ascending: false })
  if (error) throw error
  if (!list || list.length === 0) return []

  // 物件名(賃貸・売買それぞれ)
  const { data: rentals } = await supabase
    .from('m200_rent_bukken')
    .select('bukken_id, bukken_name')
    .eq('mukou_kbn', 0)
  const { data: sales } = await supabase
    .from('m300_sale_bukken')
    .select('bukken_id, bukken_name, address')
    .eq('mukou_kbn', 0)

  // 部屋番号
  const { data: rooms } = await supabase
    .from('m210_rent_room')
    .select('room_id, room_number')
    .eq('mukou_kbn', 0)

  // アカウント名
  const { data: accounts } = await supabase
    .from('m110_account')
    .select('account_id, name')
    .eq('mukou_kbn', 0)

  const rentalMap = new Map((rentals ?? []).map((b) => [b.bukken_id, b.bukken_name]))
  const saleMap = new Map((sales ?? []).map((b) => [b.bukken_id, b.bukken_name || b.address || '(名称未設定)']))
  const roomMap = new Map((rooms ?? []).map((r) => [r.room_id, r.room_number]))
  const accountMap = new Map((accounts ?? []).map((a) => [a.account_id, a.name]))

  return list.map((t) => ({
    ...t,
    bukken_name: t.bukken_kbn === 1
      ? (rentalMap.get(t.bukken_id) ?? '')
      : (saleMap.get(t.bukken_id) ?? ''),
    room_number: t.room_id ? (roomMap.get(t.room_id) ?? null) : null,
    uketsuke_name: accountMap.get(t.uketsuke_account_id) ?? '',
    tantou_name: t.tantou_account_id ? (accountMap.get(t.tantou_account_id) ?? '') : null,
  }))
}

// 対応履歴の登録フォーム用: 選択肢をまとめて取得
export async function getInquiryFormOptions() {
  const supabase = await createClient()

  const [rentals, sales, rooms, accounts] = await Promise.all([
    supabase.from('m200_rent_bukken')
      .select('bukken_id, bukken_name').eq('mukou_kbn', 0).order('bukken_name'),
    supabase.from('m300_sale_bukken')
      .select('bukken_id, bukken_name, address, bukken_category').eq('mukou_kbn', 0),
    supabase.from('m210_rent_room')
      .select('room_id, bukken_id, room_number').eq('mukou_kbn', 0).order('room_number'),
    supabase.from('m110_account')
      .select('account_id, name').eq('mukou_kbn', 0).order('name'),
  ])

  return {
    rentals: (rentals.data ?? []).map((b) => ({
      bukken_id: b.bukken_id,
      label: b.bukken_name,
    })),
    sales: (sales.data ?? []).map((b) => ({
      bukken_id: b.bukken_id,
      label: b.bukken_name || b.address || '(名称未設定)',
    })),
    rooms: rooms.data ?? [],
    accounts: accounts.data ?? [],
  }
}

export async function getTaiouRirekiDetail(taiouId: string) {
  const supabase = await createClient()

  const { data: t, error } = await supabase
    .from('t500_taiou_rireki')
    .select('taiou_id, bukken_kbn, bukken_id, room_id, taiou_kbn, status_kbn, uketsuke_date, customer_name, customer_tel, title, content, bikou, uketsuke_account_id, tantou_account_id')
    .eq('taiou_id', taiouId)
    .eq('mukou_kbn', 0)
    .single()
  if (error) throw error

  // 物件名(区分に応じて参照先を切り替え)
  let bukkenName = ''
  if (t.bukken_kbn === 1) {
    const { data } = await supabase
      .from('m200_rent_bukken')
      .select('bukken_name')
      .eq('bukken_id', t.bukken_id)
      .maybeSingle()
    bukkenName = data?.bukken_name ?? ''
  } else {
    const { data } = await supabase
      .from('m300_sale_bukken')
      .select('bukken_name, address')
      .eq('bukken_id', t.bukken_id)
      .maybeSingle()
    bukkenName = data?.bukken_name || data?.address || '(名称未設定)'
  }

  // 部屋番号
  let roomNumber: string | null = null
  if (t.room_id) {
    const { data } = await supabase
      .from('m210_rent_room')
      .select('room_number')
      .eq('room_id', t.room_id)
      .maybeSingle()
    roomNumber = data?.room_number ?? null
  }

  // 受付者・担当者名
  const { data: accounts } = await supabase
    .from('m110_account')
    .select('account_id, name')
    .eq('mukou_kbn', 0)
  const accountMap = new Map((accounts ?? []).map((a) => [a.account_id, a.name]))

  return {
    ...t,
    bukken_name: bukkenName,
    room_number: roomNumber,
    uketsuke_name: accountMap.get(t.uketsuke_account_id) ?? '',
    tantou_name: t.tantou_account_id ? (accountMap.get(t.tantou_account_id) ?? '') : null,
  }
}

// メインメニュー表示用: 未対応・対応中の件数
export async function getTaiouCounts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('t500_taiou_rireki')
    .select('status_kbn')
    .eq('mukou_kbn', 0)
    .in('status_kbn', [1, 2])   // 未対応・対応中のみ
  if (error) throw error

  const rows = data ?? []
  return {
    notYet: rows.filter((r) => r.status_kbn === 1).length,
    inProgress: rows.filter((r) => r.status_kbn === 2).length,
  }
}