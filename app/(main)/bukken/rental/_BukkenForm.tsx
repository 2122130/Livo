'use client'

import Link from 'next/link'
import { EnterToNextForm } from '@/components/common/EnterToNextForm'
import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL } from '@/constants/kbn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/common/SubmitButton'
import { useActionState } from 'react'
import type { FormState } from '@/features/actions/lv101_rental_new'

type BukkenFormValues = {
  bukken_name?: string
  bukken_category?: number
  management_type?: number
  address?: string | null
}

export function BukkenForm({
  action,
  backHref,
  values,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  backHref: string
  values?: BukkenFormValues
  submitLabel: string
}) {
  const [state, formAction] = useActionState(action, { error: null })

  return (
    <EnterToNextForm action={formAction} className="space-y-4">
      {/* エラーメッセージ */}
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="bukken_name">物件名 *</Label>
        <Input id="bukken_name" name="bukken_name" required defaultValue={values?.bukken_name ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bukken_category">種別 *</Label>
        <select id="bukken_category" name="bukken_category" required
          defaultValue={values?.bukken_category ?? 1}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {Object.entries(BUKKEN_CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="management_type">管理区分 *</Label>
        <select id="management_type" name="management_type" required
          defaultValue={values?.management_type ?? 1}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {Object.entries(MANAGEMENT_TYPE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">所在地</Label>
        <Input id="address" name="address" defaultValue={values?.address ?? ''} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button asChild variant="outline" type="button">
          <Link href={backHref}>キャンセル</Link>
        </Button>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </EnterToNextForm>
  )
}