'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

// 入居させる(入居履歴を1件追加)
export async function moveIn(
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase.from('t250_rent_room_tenancy').insert({
    org_id: account.org_id,
    bukken_id: bukkenId,
    room_id: roomId,
    tenant_name: formData.get('tenant_name') as string,
    move_in_date: formData.get('move_in_date') as string,
    bikou: (formData.get('bikou') as string) || null,
    create_account: account.name,
  })
  if (error) throw error
  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

/// 退去させる + 同時に準備を開始する(退去日=準備開始日)
export async function moveOut(
  tenancyId: string,
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const moveOutDate = formData.get('move_out_date') as string
  const supabase = await createClient()

  const { data: tenancy, error: tErr } = await supabase
    .from('t250_rent_room_tenancy')
    .select('move_in_date')
    .eq('tenancy_id', tenancyId)
    .single()
  if (tErr) throw tErr

  if (moveOutDate <= tenancy.move_in_date) {
    throw new Error('退去日は入居日より後の日付にしてください')
  }

  // 1. 退去日をセット
  const { error: outError } = await supabase
    .from('t250_rent_room_tenancy')
    .update({ move_out_date: moveOutDate, update_account: account.name })
    .eq('tenancy_id', tenancyId)
  if (outError) throw outError

  // 2. 準備セットを作成(進行中)
  const { data: set, error: setError } = await supabase
    .from('t270_rent_room_prep_set')
    .insert({
      org_id: account.org_id,
      bukken_id: bukkenId,
      room_id: roomId,
      tenancy_id: tenancyId,
      start_date: moveOutDate,
      status_kbn: 1,
      create_account: account.name,
    })
    .select('prep_set_id')
    .single()
  if (setError) throw setError

  // 3. 工程マスタの全工程を、このセットにぶら下げて作成
  const { data: processes, error: procError } = await supabase
    .from('m140_prep_process')
    .select('process_code, sort_order')
    .eq('mukou_kbn', 0)
    .order('sort_order')
  if (procError) throw procError

  const stepRows = (processes ?? []).map((p) => ({
    org_id: account.org_id,
    prep_set_id: set.prep_set_id,
    room_id: roomId,
    process_code: p.process_code,
    sort_order: p.sort_order,
    status_kbn: 1,             // 作業中
    create_account: account.name,
  }))
  if (stepRows.length > 0) {
    const { error: stepError } = await supabase
      .from('t260_rent_room_prep')
      .insert(stepRows)
    if (stepError) throw stepError
  }

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

// 1工程を完了させる。全工程が完了したら準備セットも完了にして空室へ戻す
export async function finishPrepStep(
  prepId: string,
  prepSetId: string,
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const endDate = formData.get('end_date') as string
  const supabase = await createClient()

  // 1. この工程を完了
  const { error } = await supabase
    .from('t260_rent_room_prep')
    .update({ status_kbn: 2, end_date: endDate, update_account: account.name })
    .eq('prep_id', prepId)
  if (error) throw error

  // 2. セット内に未完了工程が残っているか確認
  const { data: remaining } = await supabase
    .from('t260_rent_room_prep')
    .select('prep_id')
    .eq('prep_set_id', prepSetId)
    .eq('status_kbn', 1)
    .eq('mukou_kbn', 0)

  // 3. 残りが無ければ準備セットを完了(→ 空室へ戻る)
  if (!remaining || remaining.length === 0) {
    const { error: setError } = await supabase
      .from('t270_rent_room_prep_set')
      .update({ status_kbn: 2, update_account: account.name })
      .eq('prep_set_id', prepSetId)
    if (setError) throw setError
  }

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

// 入居履歴の備考を更新(インライン編集)
export async function updateTenancyBikou(
  roomId: string,
  bukkenId: string,
  tenancyId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase
    .from('t250_rent_room_tenancy')
    .update({ bikou: (formData.get('bikou') as string) || null, update_account: account.name })
    .eq('tenancy_id', tenancyId)
  if (error) throw error

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

export async function updateTenancyInfo(
  tenancyId: string,
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()

  const moveOutDate = formData.get('move_out_date') as string

  const { error } = await supabase
    .from('t250_rent_room_tenancy')
    .update({
      tenant_name: formData.get('tenant_name') as string,
      move_in_date: formData.get('move_in_date') as string,
      move_out_date: moveOutDate || null,   // 空なら入居中(null)
      bikou: (formData.get('bikou') as string) || null,
      update_account: account.name,
    })
    .eq('tenancy_id', tenancyId)
  if (error) throw error

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

export async function updatePrepStepDate(
  prepId: string,
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()

  const endDate = formData.get('end_date') as string

  const { error } = await supabase
    .from('t260_rent_room_prep')       // 工程テーブル(実際のテーブル名に合わせてください)
    .update({
      end_date: endDate || null,
      update_account: account.name,
    })
    .eq('prep_id', prepId)
  if (error) throw error

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}