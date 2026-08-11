'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

// アップロード(契約書 or 写真)
export async function uploadTenancyFile(
  tenancyId: string,
  roomId: string,
  bukkenId: string,
  fileCategory: number,
  formData: FormData
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  // 複数ファイルを取得
  const files = formData.getAll('file') as File[]
  const validFiles = files.filter((f) => f && f.size > 0)
  if (validFiles.length === 0) return

  const supabase = await createClient()

  // 現在の最大sort_orderを取得(同カテゴリ内)
  const { data: existing } = await supabase
    .from('t280_tenancy_file')
    .select('sort_order')
    .eq('tenancy_id', tenancyId)
    .eq('file_category', fileCategory)
    .eq('mukou_kbn', 0)
    .order('sort_order', { ascending: false })
    .limit(1)
  let nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  // ファイルを順にアップロード
  for (const file of validFiles) {
    const ext = file.name.split('.').pop() ?? 'dat'
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const storagePath = `${account.org_id}/${tenancyId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('tenancy-files')
      .upload(storagePath, file)
    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('t280_tenancy_file').insert({
      org_id: account.org_id,
      tenancy_id: tenancyId,
      room_id: roomId,
      file_category: fileCategory,
      storage_path: storagePath,
      file_name: file.name,
      sort_order: nextOrder,
      create_account: account.name,
    })
    if (insertError) throw insertError

    nextOrder++   // 次のファイルの順番
  }

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}

// 削除
export async function deleteTenancyFile(
  fileId: string,
  storagePath: string,
  roomId: string,
  bukkenId: string
) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()

  // 自組織のファイルか確認
  const { data: target } = await supabase
    .from('t280_tenancy_file')
    .select('file_id, org_id')
    .eq('file_id', fileId)
    .single()
  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  // Storageから削除
  await supabase.storage.from('tenancy-files').remove([storagePath])
  // DBから削除
  await supabase.from('t280_tenancy_file').delete().eq('file_id', fileId)

  revalidatePath(`/bukken/rental/${bukkenId}/rooms/${roomId}`)
}