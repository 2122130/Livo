'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'
import { createAdminClient } from '@/lib/supabase/admin'

export type FormState = { error: string | null }

export async function createTaiouRireki(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const bukkenId = formData.get('bukken_id') as string
  if (!bukkenId) return { error: '物件を選択してください' }

  const content = (formData.get('content') as string)?.trim()
  if (!content) return { error: '対応内容を入力してください' }

  const supabase = await createClient()

  const roomId = formData.get('room_id') as string
  const tantouId = formData.get('tantou_account_id') as string

  const { error } = await supabase.from('t500_taiou_rireki').insert({
    org_id: account.org_id,
    bukken_kbn: Number(formData.get('bukken_kbn')),
    bukken_id: formData.get('bukken_id') as string,
    room_id: roomId || null,               // 賃貸で部屋指定なしならnull
    taiou_kbn: Number(formData.get('taiou_kbn')),
    status_kbn: Number(formData.get('status_kbn')),
    uketsuke_date: formData.get('uketsuke_date') as string,
    customer_name: (formData.get('customer_name') as string) || null,
    customer_tel: (formData.get('customer_tel') as string) || null,
    title: (formData.get('title') as string) || null,
    content: formData.get('content') as string,
    uketsuke_account_id: formData.get('uketsuke_account_id') as string,
    tantou_account_id: tantouId || null,   // 未アサインならnull
    bikou: (formData.get('bikou') as string) || null,
    create_account: account.name,
  })
  if (error) return { error: '登録に失敗しました。' }

  revalidatePath('/inquiries')
  redirect('/inquiries')
}

// 対応履歴の更新
export async function updateTaiouRireki(
  taiouId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const bukkenId = formData.get('bukken_id') as string
  if (!bukkenId) return { error: '物件を選択してください' }

  const content = (formData.get('content') as string)?.trim()
  if (!content) return { error: '対応内容を入力してください' }

  const supabase = await createClient()
  const roomId = formData.get('room_id') as string
  const tantouId = formData.get('tantou_account_id') as string

  const { error } = await supabase
    .from('t500_taiou_rireki')
    .update({
      bukken_kbn: Number(formData.get('bukken_kbn')),
      bukken_id: formData.get('bukken_id') as string,
      room_id: roomId || null,
      taiou_kbn: Number(formData.get('taiou_kbn')),
      status_kbn: Number(formData.get('status_kbn')),
      uketsuke_date: formData.get('uketsuke_date') as string,
      customer_name: (formData.get('customer_name') as string) || null,
      customer_tel: (formData.get('customer_tel') as string) || null,
      content: formData.get('content') as string,
      uketsuke_account_id: formData.get('uketsuke_account_id') as string,
      tantou_account_id: tantouId || null,
      update_account: account.name,
    })
    .eq('taiou_id', taiouId)
  if (error) return { error: '更新に失敗しました。' }

  revalidatePath('/inquiries')
  redirect(`/inquiries`)
}

// 対応履歴の削除(論理削除)
export async function deleteTaiouRireki(taiouId: string, _formData?: FormData) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()
  const { data: target } = await supabase
    .from('t500_taiou_rireki')
    .select('taiou_id, org_id')
    .eq('taiou_id', taiouId)
    .eq('mukou_kbn', 0)
    .single()
  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('t500_taiou_rireki')
    .update({ mukou_kbn: 1, update_account: account.name })
    .eq('taiou_id', taiouId)
  if (error) throw error

  revalidatePath('/inquiries')
  redirect('/inquiries')
}