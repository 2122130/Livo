'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

export type DraftKey = {
  roomId: string
  tenancyKey: string
  sheetType: 'house' | 'store'
}

export type DraftValues = { e: string[]; c: boolean[] }

// 書きかけの契約書を保存(同じ部屋・入居・用紙なら上書き)
export async function saveContractDraft(
  key: DraftKey,
  layoutVersion: string,
  values: DraftValues,
): Promise<{ ok: boolean; savedAt?: string; error?: string }> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  // 念のため中身の形と大きさを確認
  if (!Array.isArray(values?.e) || !Array.isArray(values?.c)) return { ok: false, error: '保存する内容が不正です' }
  if (values.e.length > 500 || values.c.length > 100) return { ok: false, error: '保存する内容が多すぎます' }
  const e = values.e.map((v) => String(v ?? '').slice(0, 2000))
  const c = values.c.map((v) => !!v)

  const supabase = await createClient()
  const savedAt = new Date().toISOString()
  const { error } = await supabase
    .from('t600_contract_draft')
    .upsert(
      {
        org_id: String(account.org_id),
        room_id: key.roomId,
        tenancy_key: key.tenancyKey,
        sheet_type: key.sheetType,
        layout_version: layoutVersion,
        values: { e, c },
        update_account: account.name,
        update_date: savedAt,
      },
      { onConflict: 'room_id,tenancy_key,sheet_type' },
    )
  if (error) return { ok: false, error: '保存に失敗しました。通信状態を確認してください。' }
  return { ok: true, savedAt }
}

// 書きかけを消して、Livoの情報だけの状態に戻す
export async function resetContractDraft(key: DraftKey): Promise<{ ok: boolean }> {
  const account = await getMyAccount()
  if (!account) redirect('/login')
  const supabase = await createClient()
  const { error } = await supabase
    .from('t600_contract_draft')
    .delete()
    .eq('room_id', key.roomId)
    .eq('tenancy_key', key.tenancyKey)
    .eq('sheet_type', key.sheetType)
  return { ok: !error }
}
