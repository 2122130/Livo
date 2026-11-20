import { formatCustomValue, type CustomField, type CustomValues } from '@/lib/custom-fields'

// 詳細画面・書類で、追加項目の値を「項目名 / 値」の行で表示する
export function CustomFieldRows({
  fields,
  values,
  showEmpty = false,
}: {
  fields: CustomField[]
  values?: CustomValues | null
  showEmpty?: boolean
}) {
  return (
    <>
      {fields.map((f) => {
        const v = formatCustomValue(f, values?.[f.field_id])
        if (v === null && !showEmpty) return null
        return (
          <div key={f.field_id} className="flex justify-between gap-4 border-b py-2 text-sm">
            <span className="shrink-0 text-muted-foreground">{f.label}</span>
            <span className="whitespace-pre-wrap text-right">{v ?? '—'}</span>
          </div>
        )
      })}
    </>
  )
}
