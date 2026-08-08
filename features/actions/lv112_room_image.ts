'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

export async function uploadRoomImage(
  roomId: string,
  bukkenId: string,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const file = formData.get('image') as File
  if (!file || file.size === 0) {
    return   // ファイルなしなら何もしない
  }

  const supabase = await createClient()

  const title = (formData.get('title') as string) || null
  
  // 保存パス: {org_id}/{room_id}/{タイムスタンプ}_{ファイル名}
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}.${ext}`
  const storagePath = `${account.org_id}/${roomId}/${fileName}`

  // Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from('room-images')
    .upload(storagePath, file)
  if (uploadError) throw uploadError

  // 現在の最大sort_orderを取得して+1
  const { data: existing } = await supabase
    .from('t210_room_image')
    .select('sort_order')
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .order('sort_order', { ascending: false })
    .limit(1)
  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  // DBにレコードを追加
  const { error: insertError } = await supabase.from('t210_room_image').insert({
    org_id: account.org_id,
    room_id: roomId,
    storage_path: storagePath,
    title: title,
    sort_order: nextOrder,
    create_account: account.name,
  })
  if (insertError) throw insertError

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

// 画像削除
export async function deleteRoomImage(
  imageId: string,
  storagePath: string,
  roomId: string,
  bukkenId: string
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()

  // 自組織の画像か確認
  const { data: target } = await supabase
    .from('t210_room_image')
    .select('image_id, org_id')
    .eq('image_id', imageId)
    .single()
  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  // Storageから削除
  await supabase.storage.from('room-images').remove([storagePath])

  // DBからも削除(物理削除。論理削除にしたいならmukou_kbn=1に)
  await supabase.from('t210_room_image').delete().eq('image_id', imageId)

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}