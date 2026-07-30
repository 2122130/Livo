'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccount } from '@/features/auth/get-my-account'

export type FormState = { error: string | null }

export async function createRentalBukken(
  _prevState: FormState,      // useActionStateが前回の状態を渡してくる(第1引数)
  formData: FormData
): Promise<FormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const bukkenName = (formData.get('bukken_name') as string)?.trim()
  if (!bukkenName) {
    return { error: '物件名を入力してください' }   // throwせず、エラーを返す
  }

  const supabase = await createClient()
  const { error } = await supabase.from('m200_rent_bukken').insert({
    org_id: account.org_id,
    bukken_name: bukkenName,
    bukken_category: Number(formData.get('bukken_category')),
    management_type: Number(formData.get('management_type')),
    address: (formData.get('address') as string) || null,
    create_account: account.name,
  })
  if (error) {
    return { error: '登録に失敗しました。時間をおいて再度お試しください。' }
  }

  revalidatePath('/bukken')
  redirect('/bukken?tab=rental')
}

// 物件の更新(編集画面から)
export async function updateRentalBukken(bukkenId: string, formData: FormData) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase
    .from('m200_rent_bukken')
    .update({
      bukken_name: formData.get('bukken_name') as string,
      bukken_category: Number(formData.get('bukken_category')),
      management_type: Number(formData.get('management_type')),
      address: (formData.get('address') as string) || null,
      update_account: account.name,
    })
    .eq('bukken_id', bukkenId)
  if (error) throw error

  revalidatePath('/bukken')
  redirect('/bukken?tab=rental')
}

// 物件の削除(論理削除 mukou_kbn=1)
export async function deleteRentalBukken(bukkenId: string, _formData?: FormData) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  // 通常クライアントで「自組織の物件か」を確認(RLSで自組織しか見えない)
  const supabase = await createClient()
  const { data: target } = await supabase
    .from('m200_rent_bukken')
    .select('bukken_id, org_id')
    .eq('bukken_id', bukkenId)
    .eq('mukou_kbn', 0)
    .single()

  // 自組織の物件でなければ拒否
  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  // service roleで論理削除(RLSを迂回)
  const admin = createAdminClient()
  const { error } = await admin
    .from('m200_rent_bukken')
    .update({ mukou_kbn: 1, update_account: account.name })
    .eq('bukken_id', bukkenId)
  if (error) throw error

  revalidatePath('/bukken')
  redirect('/bukken?tab=rental')
}