'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cfName, type CustomField, type CustomValues } from '@/lib/custom-fields'

// 設定画面で足した項目を、登録・編集フォームに並べる
export function CustomFieldInputs({
  fields,
  values,
}: {
  fields?: CustomField[]
  values?: CustomValues | null
}) {
  if (!fields || fields.length === 0) return null

  return (
    <div className="space-y-4 rounded-md border border-dashed p-3">
      <p className="text-sm font-medium text-muted-foreground">追加項目</p>
      {fields.map((f) => {
        const name = cfName(f.field_id)
        const v = values?.[f.field_id]
        const dv = v === null || v === undefined ? '' : String(v)
        return (
          <div key={f.field_id} className="space-y-1">
            <Label htmlFor={name}>{f.label}</Label>
            {f.field_type === 'textarea' ? (
              <textarea id={name} name={name} defaultValue={dv} rows={3}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm" />
            ) : (
              <Input id={name} name={name} defaultValue={dv}
                type={f.field_type === 'number' ? 'number' : f.field_type === 'date' ? 'date' : 'text'}
                step={f.field_type === 'number' ? 'any' : undefined} />
            )}
          </div>
        )
      })}
    </div>
  )
}
