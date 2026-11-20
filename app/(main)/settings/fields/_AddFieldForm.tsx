'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addCustomField, type FormState } from '@/features/actions/lv930_custom_fields'
import { CUSTOM_TARGET_LABEL, CUSTOM_TYPE_LABEL } from '@/lib/custom-fields'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/common/SubmitButton'

export function AddFieldForm() {
  const [state, formAction] = useActionState<FormState, FormData>(addCustomField, { error: null })
  const labelRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.ok && labelRef.current) {
      labelRef.current.value = ''
      labelRef.current.focus()
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="rounded-md border border-green-600/40 bg-green-50 px-3 py-2 text-sm text-green-800">
          項目を追加しました。登録・編集画面に表示されます。
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="target">どこに足すか *</Label>
          <select id="target" name="target" required defaultValue="room"
            className="w-full rounded-md border bg-white px-3 py-2 text-sm">
            {Object.entries(CUSTOM_TARGET_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="label">項目名 *</Label>
          <Input ref={labelRef} id="label" name="label" required maxLength={40} placeholder="例: 鍵番号" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="field_type">種類 *</Label>
          <select id="field_type" name="field_type" required defaultValue="text"
            className="w-full rounded-md border bg-white px-3 py-2 text-sm">
            {Object.entries(CUSTOM_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton>項目を追加</SubmitButton>
      </div>
    </form>
  )
}
