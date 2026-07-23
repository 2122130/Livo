import { createClient } from '@/lib/supabase/server'

export async function getRentalBukkenList() {
  const supabase = await createClient()

  // 物件一覧
  const { data: bukkenList, error } = await supabase
    .from('m200_rent_bukken')
    .select('bukken_id, bukken_name, bukken_category, management_type, address')
    .eq('mukou_kbn', 0)
    .order('create_date', { ascending: false })
  if (error) throw error

  // 各物件の部屋状態(ビューから、自組織ぶん一括取得)
  const { data: statuses, error: sErr } = await supabase
    .from('v_rent_room_status')
    .select('bukken_id, room_status')
  if (sErr) throw sErr

  // 物件ごとに 総戸数 / 空室数 を集計
  return (bukkenList ?? []).map((b) => {
    const rooms = (statuses ?? []).filter((s) => s.bukken_id === b.bukken_id)
    const total = rooms.length
    const vacant = rooms.filter((s) => s.room_status === 1).length
    return { ...b, total_units: total, vacant_units: vacant }
  })
}

// 物件1件の情報(部屋一覧のヘッダー表示用)
export async function getRentalBukken(bukkenId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('m200_rent_bukken')
    .select('bukken_id, bukken_name, bukken_category, management_type, address')
    .eq('bukken_id', bukkenId)
    .eq('mukou_kbn', 0)
    .single()
  if (error) throw error
  return data
}

// 物件に紐づく部屋一覧(現在状態つき)
export async function getRoomsByBukken(bukkenId: string) {
  const supabase = await createClient()

  // 部屋の基本情報
  const { data: rooms, error } = await supabase
    .from('m210_rent_room')
    .select('room_id, room_number, layout, rent, other_fee, parking_number, guarantee_company')
    .eq('bukken_id', bukkenId)
    .eq('mukou_kbn', 0)
    .order('room_number')
  if (error) throw error

  // 現在状態(ビューから)
  const { data: statuses, error: statusError } = await supabase
    .from('v_rent_room_status')
    .select('room_id, room_status')
    .eq('bukken_id', bukkenId)
  if (statusError) throw statusError

  // room_id で状態をひも付け
  const statusMap = new Map(
    (statuses ?? []).map((s) => [s.room_id, s.room_status])
  )
  return (rooms ?? []).map((r) => ({
    ...r,
    room_status: statusMap.get(r.room_id) ?? 1, // 履歴がなければ空室
  }))
}

// 部屋1件の詳細(基本情報 + 現在状態)
export async function getRoomDetail(roomId: string) {
  const supabase = await createClient()

  const { data: room, error } = await supabase
    .from('m210_rent_room')
    .select('room_id, bukken_id, room_number, layout, rent, other_fee, parking_number, guarantee_company, m200_rent_bukken(bukken_name)')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .single()
  if (error) throw error

  const { data: status } = await supabase
    .from('v_rent_room_status')
    .select('room_status')
    .eq('room_id', roomId)
    .single()

  // ネストした物件名を平坦化
  const bukken = room.m200_rent_bukken as unknown as { bukken_name: string } | null
  return { ...room, bukken_name: bukken?.bukken_name ?? '', room_status: status?.room_status ?? 1 }
}

// 入居履歴(新しい順)
export async function getTenancyHistory(roomId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('t250_rent_room_tenancy')
    .select('tenancy_id, tenant_name, move_in_date, move_out_date, bikou')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .order('move_in_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// 工程マスタ(退去時に全工程を作るため)
export async function getPrepProcesses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('m140_prep_process')
    .select('process_code, process_name, sort_order')
    .eq('mukou_kbn', 0)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

// 進行中の準備セット(あれば)＋その工程一覧
export async function getActivePrepSet(roomId: string) {
  const supabase = await createClient()

  const { data: set } = await supabase
    .from('t270_rent_room_prep_set')
    .select('prep_set_id, start_date, status_kbn')
    .eq('room_id', roomId)
    .eq('status_kbn', 1)          // 進行中
    .eq('mukou_kbn', 0)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!set) return null

  const { data: steps } = await supabase
    .from('t260_rent_room_prep')
    .select('prep_id, process_code, sort_order, status_kbn, start_date, end_date')
    .eq('prep_set_id', set.prep_set_id)
    .eq('mukou_kbn', 0)
    .order('sort_order')

  return { ...set, steps: steps ?? [] }
}

// 準備セットの履歴(完了済み含む。工程を含めて取得。表示用)
export async function getPrepSetHistory(roomId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('t270_rent_room_prep_set')
    .select('prep_set_id, start_date, status_kbn, t260_rent_room_prep(prep_id, process_code, status_kbn, start_date, end_date, sort_order)')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .order('start_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// 入居履歴 + 各入居に紐づく準備工程(完了日)を統合して取得
export async function getTenancyWithPrep(roomId: string) {
  const supabase = await createClient()

  // 入居履歴
  const { data: tenancies, error } = await supabase
    .from('t250_rent_room_tenancy')
    .select('tenancy_id, tenant_name, move_in_date, move_out_date, bikou')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .order('move_in_date', { ascending: false })
  if (error) throw error

  // この部屋の準備セット + 工程(tenancy_idで入居履歴に紐づく)
  const { data: sets } = await supabase
    .from('t270_rent_room_prep_set')
    .select('prep_set_id, tenancy_id, t260_rent_room_prep(process_code, status_kbn, end_date, sort_order)')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)

  // tenancy_id → 工程配列 のマップを作る
  const prepByTenancy = new Map<string, { process_code: number; status_kbn: number; end_date: string | null }[]>()
  for (const s of sets ?? []) {
    if (!s.tenancy_id) continue
    const steps = (s.t260_rent_room_prep as unknown as {
      process_code: number; status_kbn: number; end_date: string | null; sort_order: number
    }[]) ?? []
    prepByTenancy.set(s.tenancy_id, steps)
  }

  // 入居履歴に工程をひも付け
  return (tenancies ?? []).map((t) => ({
    ...t,
    steps: prepByTenancy.get(t.tenancy_id) ?? [],
  }))
}

// 空室管理: 組織全体の空室の部屋を、物件情報つきで取得
export async function getVacantRooms() {
  const supabase = await createClient()

  // 空室(room_status=1)の部屋をビューから取得
  const { data: vacant, error } = await supabase
    .from('v_rent_room_status')
    .select('room_id, bukken_id, room_number, room_status')
    .eq('room_status', 1)
  if (error) throw error

  if (!vacant || vacant.length === 0) return []

  // 部屋の詳細(賃料など)を取得
  const roomIds = vacant.map((v) => v.room_id)
  const { data: rooms } = await supabase
    .from('m210_rent_room')
    .select('room_id, bukken_id, room_number, layout, rent, other_fee, parking_number, guarantee_company')
    .in('room_id', roomIds)
    .eq('mukou_kbn', 0)

  // 物件名を取得
  const { data: bukkens } = await supabase
    .from('m200_rent_bukken')
    .select('bukken_id, bukken_name, address')
    .eq('mukou_kbn', 0)

  const bukkenMap = new Map((bukkens ?? []).map((b) => [b.bukken_id, b]))

  // 部屋 + 物件情報を結合
  return (rooms ?? []).map((r) => {
    const bukken = bukkenMap.get(r.bukken_id)
    return {
      ...r,
      bukken_name: bukken?.bukken_name ?? '',
      bukken_address: bukken?.address ?? null,
    }
  })
}