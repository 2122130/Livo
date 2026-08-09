'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'
import { createAdminClient } from '@/lib/supabase/admin'

// 種別コード → 詳細テーブル名
const DETAIL_TABLE: Record<number, string> = {
  1: 'm301_sale_bukken_mansion',
  2: 'm302_sale_bukken_apartment',
  3: 'm303_sale_bukken_house',
  4: 'm304_sale_bukken_land',
}

const toNum = (v: FormDataEntryValue | null) =>
  v === null || v === '' ? null : Number(v)

export type FormState = { error: string | null }

export async function createSaleBukken(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()
  const category = Number(formData.get('bukken_category'))

  // 1. 共通テーブルにINSERT
  const { data: created, error } = await supabase
    .from('m300_sale_bukken')
    .insert({
      org_id: account.org_id,
      bukken_category: category,
      bukken_name: (formData.get('bukken_name') as string) || null,
      trade_status: toNum(formData.get('trade_status')),
      management_type: Number(formData.get('management_type')),
      price: toNum(formData.get('price')),
      address: (formData.get('address') as string) || null,
      transaction_type: toNum(formData.get('transaction_type')),
      create_account: account.name,
    })
    .select('bukken_id')
    .single()
  if (error) return { error: '登録に失敗しました。' }

  const bukkenId = created.bukken_id

  // 2. 種別ごとの詳細テーブルにINSERT
  const detailTable = DETAIL_TABLE[category]
  if (detailTable) {
    let detailData: Record<string, unknown> = { bukken_id: bukkenId, create_account: account.name }

    if (category === 1) { // マンション
      detailData = {
        ...detailData,
        floor_plan: (formData.get('floor_plan') as string) || null,
        exclusive_area: toNum(formData.get('exclusive_area')),
      }
    } else if (category === 2) { // アパート
      detailData = {
        ...detailData,
        yield_rate: toNum(formData.get('yield_rate')),
        total_floor_area: toNum(formData.get('total_floor_area')),
        land_area: toNum(formData.get('land_area')),
      }
    } else if (category === 3) { // 戸建て
      detailData = {
        ...detailData,
        floor_plan: (formData.get('floor_plan') as string) || null,
        total_floor_area: toNum(formData.get('total_floor_area')),
        land_area: toNum(formData.get('land_area')),
      }
    } else if (category === 4) { // 土地
      detailData = {
        ...detailData,
        land_area: toNum(formData.get('land_area')),
        current_status: toNum(formData.get('current_status')),
      }
    }

    const { error: detailError } = await supabase
      .from(detailTable)
      .insert(detailData)
    if (detailError) return { error: '詳細情報の登録に失敗しました。' }
  }

  revalidatePath('/bukken')
  redirect('/bukken?tab=sale')
}

// 売買物件の更新(種別は変更しない前提)
export async function updateSaleBukken(
  bukkenId: string,
  category: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState>{
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const supabase = await createClient()

  // 1. 共通テーブルを更新
  const { error } = await supabase
    .from('m300_sale_bukken')
    .update({
      bukken_name: (formData.get('bukken_name') as string) || null,
      trade_status: toNum(formData.get('trade_status')),
      management_type: Number(formData.get('management_type')),
      price: toNum(formData.get('price')),
      address: (formData.get('address') as string) || null,
      transaction_type: toNum(formData.get('transaction_type')),
      update_account: account.name,
    })
    .eq('bukken_id', bukkenId)
  if (error) return { error: '更新に失敗しました。' }

  // 2. 種別詳細テーブルを更新
  const detailTable = DETAIL_TABLE[category]
  if (detailTable) {
    let detailData: Record<string, unknown> = { update_account: account.name }
    if (category === 1) {
      detailData = { ...detailData,
        floor_plan: (formData.get('floor_plan') as string) || null,
        exclusive_area: toNum(formData.get('exclusive_area')) }
    } else if (category === 2) {
      detailData = { ...detailData,
        yield_rate: toNum(formData.get('yield_rate')),
        total_floor_area: toNum(formData.get('total_floor_area')),
        land_area: toNum(formData.get('land_area')) }
    } else if (category === 3) {
      detailData = { ...detailData,
        floor_plan: (formData.get('floor_plan') as string) || null,
        total_floor_area: toNum(formData.get('total_floor_area')),
        land_area: toNum(formData.get('land_area')) }
    } else if (category === 4) {
      detailData = { ...detailData,
        land_area: toNum(formData.get('land_area')),
        current_status: toNum(formData.get('current_status')) }
    }

    const { error: detailError } = await supabase
      .from(detailTable)
      .update(detailData)
      .eq('bukken_id', bukkenId)
    if (detailError) return { error: '詳細情報の更新に失敗しました。' }
  }

  revalidatePath('/bukken')
  redirect(`/bukken/sale/${bukkenId}`)
}

// 売買物件の削除(論理削除。service role方式)
export async function deleteSaleBukken(bukkenId: string, _formData?: FormData) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  // 自組織の物件か確認(通常クライアント=RLSで自組織のみ見える)
  const supabase = await createClient()
  const { data: target } = await supabase
    .from('m300_sale_bukken')
    .select('bukken_id, org_id')
    .eq('bukken_id', bukkenId)
    .eq('mukou_kbn', 0)
    .single()
  if (!target || target.org_id !== account.org_id) {
    throw new Error('削除対象が見つかりません')
  }

  // service roleで論理削除
  const admin = createAdminClient()
  const { error } = await admin
    .from('m300_sale_bukken')
    .update({ mukou_kbn: 1, update_account: account.name })
    .eq('bukken_id', bukkenId)
  if (error) throw error

  revalidatePath('/bukken')
  redirect('/bukken?tab=sale')
}