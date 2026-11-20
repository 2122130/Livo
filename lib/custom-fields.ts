// 追加項目(会社ごとに自分で足せる項目)の共通定義。
// サーバー・画面のどちらからも使う。

export type CustomFieldTarget = 'rental' | 'room' | 'sale'
export type CustomFieldType = 'text' | 'number' | 'date' | 'textarea'

export type CustomField = {
  field_id: string
  target: CustomFieldTarget
  label: string
  field_type: CustomFieldType
  sort_order: number
}

export type CustomValues = Record<string, string | number | null>

export const CUSTOM_TARGET_LABEL: Record<CustomFieldTarget, string> = {
  rental: '賃貸物件',
  room: '賃貸の部屋',
  sale: '売買物件',
}

export const CUSTOM_TYPE_LABEL: Record<CustomFieldType, string> = {
  text: '文字(1行)',
  textarea: '文字(複数行)',
  number: '数字',
  date: '日付',
}

// フォームの入力欄の name
export const cfName = (fieldId: string) => `cf_${fieldId}`

// 送信されたフォームから追加項目の値を取り出す
export function parseCustomFields(formData: FormData, defs: CustomField[]): CustomValues {
  const out: CustomValues = {}
  for (const d of defs) {
    const raw = formData.get(cfName(d.field_id))
    if (raw === null) continue
    const v = String(raw).trim()
    if (v === '') {
      out[d.field_id] = null
    } else if (d.field_type === 'number') {
      const n = Number(v.replace(/[,，円㎡%]/g, ''))
      out[d.field_id] = Number.isFinite(n) ? n : v
    } else {
      out[d.field_id] = v
    }
  }
  return out
}

// 表示用に値を整える
export function formatCustomValue(d: Pick<CustomField, 'field_type'>, v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (d.field_type === 'number' && typeof v === 'number') return v.toLocaleString()
  return String(v)
}
