import { createClient } from '@/lib/supabase/server'
import { parseCustomFields, type CustomField, type CustomFieldTarget, type CustomValues } from '@/lib/custom-fields'

// 対象(賃貸物件・部屋・売買物件)ごとの追加項目の一覧
export async function getCustomFields(target: CustomFieldTarget): Promise<CustomField[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('m950_custom_field')
    .select('field_id, target, label, field_type, sort_order')
    .eq('target', target)
    .eq('mukou_kbn', 0)
    .order('sort_order')
    .order('create_date')
  if (error) throw error
  return (data ?? []) as CustomField[]
}

// 設定画面用: すべての対象の追加項目
export async function getAllCustomFields(): Promise<CustomField[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('m950_custom_field')
    .select('field_id, target, label, field_type, sort_order')
    .eq('mukou_kbn', 0)
    .order('target')
    .order('sort_order')
    .order('create_date')
  if (error) throw error
  return (data ?? []) as CustomField[]
}

// 保存用: フォームの追加項目の値を、既存の値に重ねる(外した項目の値は消さない)
export async function buildCustomValues(
  target: CustomFieldTarget,
  formData: FormData,
  existing?: { table: string; pk: string; id: string },
): Promise<CustomValues> {
  const defs = await getCustomFields(target)
  const parsed = parseCustomFields(formData, defs)
  if (!existing) return parsed
  const supabase = await createClient()
  const { data } = await supabase
    .from(existing.table)
    .select('custom_fields')
    .eq(existing.pk, existing.id)
    .maybeSingle()
  const prev = ((data as { custom_fields?: CustomValues } | null)?.custom_fields ?? {}) as CustomValues
  return { ...prev, ...parsed }
}
