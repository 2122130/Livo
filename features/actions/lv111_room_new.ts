'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'
import { createAdminClient } from '@/lib/supabase/admin'

export type FormState = { error: string | null }

export async function createRoom(
  bukkenId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const roomNumber = (formData.get('room_number') as string)?.trim()
  if (!roomNumber) return { error: '部屋番号を入力してください' }

  const toNum = (v: FormDataEntryValue | null) =>
    v === null || v === '' ? null : Number(v)

  const supabase = await createClient()
  const { error } = await supabase.from('m210_rent_room').insert({
    org_id: account.org_id,
    bukken_id: bukkenId,
    room_number: roomNumber,
    layout: (formData.get('layout') as string) || null,
    rent: toNum(formData.get('rent')),
    other_fee: toNum(formData.get('other_fee')),
    parking_number: (formData.get('parking_number') as string) || null,
    guarantee_company: (formData.get('guarantee_company') as string) || null,
    create_account: account.name,
  })
  if (error) return { error: '登録に失敗しました。時間をおいて再度お試しください。' }

  revalidatePath(`/bukken/rental/${bukkenId}/rooms`)
  redirect(`/bukken/rental/${bukkenId}/rooms`)
}

// 部屋情報の更新(編集画面から。roomId指定で既存部屋を更新)
export async function updateRoom(
    roomId: string,
    bukkenId: string,
    _prevState: FormState,
    formData: FormData
): Promise<FormState>  {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const toNum = (v: FormDataEntryValue | null) =>
    v === null || v === '' ? null : Number(v)

  const supabase = await createClient()
  const { error } = await supabase
    .from('m210_rent_room')
    .update({
      room_number: formData.get('room_number') as string,
      layout: (formData.get('layout') as string) || null,
      rent: toNum(formData.get('rent')),
      other_fee: toNum(formData.get('other_fee')),
      parking_number: (formData.get('parking_number') as string) || null,
      guarantee_company: (formData.get('guarantee_company') as string) || null,
      update_account: account.name,
    })
    .eq('room_id', roomId)
  if (error) return { error: '更新に失敗しました。' } 

  revalidatePath(`/bukken/rental/${bukkenId}/rooms`)
  redirect(`/bukken/rental/${bukkenId}/rooms/${roomId}`)  // 編集後は部屋詳細へ
}

// 部屋の削除(論理削除 mukou_kbn=1)
export async function deleteRoom(roomId: string, bukkenId: string, _formData?: FormData) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  // 通常クライアントで自組織の部屋か確認(RLSで自組織しか見えない)
  const supabase = await createClient()
  const { data: target } = await supabase
    .from('m210_rent_room')
    .select('room_id, org_id')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .single()

  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  // service roleで論理削除
  const admin = createAdminClient()
  const { error } = await admin
    .from('m210_rent_room')
    .update({ mukou_kbn: 1, update_account: account.name })
    .eq('room_id', roomId)
  if (error) throw error

  revalidatePath(`/bukken/rental/${bukkenId}/rooms`)
  redirect(`/bukken/rental/${bukkenId}/rooms`)
}