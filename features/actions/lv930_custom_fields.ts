'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'
import type { CustomFieldTarget, CustomFieldType } from '@/lib/custom-fields'

export type FormState = { error: string | null; ok?: boolean }

const TARGETS: CustomFieldTarget[] = ['rental', 'room', 'sale']
const TYPES: CustomFieldType[] = ['text', 'number', 'date', 'textarea']

async function requireAdmin() {
  const account = await getMyAccount()
  if (!account) redirect('/login')
  if (account.role !== ROLE.ADMIN && account.role !== ROLE.SYSTEM) redirect('/settings')
  return account
}

// 項目を追加
export async function addCustomField(_prev: FormState, formData: FormData): Promise<FormState> {
  const account = await requireAdmin()

  const target = formData.get('target') as CustomFieldTarget
  const fieldType = formData.get('field_type') as CustomFieldType
  const label = (formData.get('label') as string)?.trim()

  if (!TARGETS.includes(target)) return { error: '対象を選んでください' }
  if (!TYPES.includes(fieldType)) return { error: '種類を選んでください' }
  if (!label) return { error: '項目名を入力してください' }
  if (label.length > 40) return { error: '項目名は40文字以内にしてください' }

  const supabase = await createClient()

  // 並び順は末尾に
  const { data: last } = await supabase
    .from('m950_custom_field')
    .select('sort_order')
    .eq('target', target)
    .eq('mukou_kbn', 0)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('m950_custom_field').insert({
    org_id: String(account.org_id),
    target,
    label,
    field_type: fieldType,
    sort_order: (last?.sort_order ?? 0) + 10,
    create_account: account.name,
  })
  if (error) return { error: '追加に失敗しました。時間をおいて再度お試しください。' }

  revalidatePath('/settings/fields')
  return { error: null, ok: true }
}

// 項目を外す(入力済みの値は消さずに残す)
export async function removeCustomField(fieldId: string, _formData?: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('m950_custom_field')
    .update({ mukou_kbn: 1 })
    .eq('field_id', fieldId)
  if (error) throw error
  revalidatePath('/settings/fields')
}

// 並び順を1つ上/下へ
export async function moveCustomField(fieldId: string, direction: 'up' | 'down', _formData?: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: me } = await supabase
    .from('m950_custom_field')
    .select('field_id, target, sort_order')
    .eq('field_id', fieldId)
    .single()
  if (!me) return

  const { data: list } = await supabase
    .from('m950_custom_field')
    .select('field_id, sort_order')
    .eq('target', me.target)
    .eq('mukou_kbn', 0)
    .order('sort_order')
    .order('create_date')
  if (!list) return

  const idx = list.findIndex((f) => f.field_id === fieldId)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return

  // 並び順を振り直してから入れ替える
  const reordered = list.map((f, i) => ({ ...f, sort_order: (i + 1) * 10 }))
  const a = reordered[idx]
  const b = reordered[swapIdx]
  ;[a.sort_order, b.sort_order] = [b.sort_order, a.sort_order]

  for (const f of reordered) {
    await supabase.from('m950_custom_field').update({ sort_order: f.sort_order }).eq('field_id', f.field_id)
  }
  revalidatePath('/settings/fields')
}
