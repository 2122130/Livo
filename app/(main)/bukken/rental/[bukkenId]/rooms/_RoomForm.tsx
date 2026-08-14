'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnterToNextForm } from '@/components/common/EnterToNextForm'
import { SubmitButton } from '@/components/common/SubmitButton'
import { useActionState } from 'react'
import type { FormState } from '@/features/actions/lv111_room_new'
import { LoadingLink } from '@/components/common/LoadingLink'

type RoomFormValues = {
  room_number?: string
  layout?: string | null
  rent?: number | null
  other_fee?: number | null
  parking_number?: string | null
  guarantee_company?: string | null
}

export function RoomForm({
  action,
  backHref,
  values,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  backHref: string
  values?: RoomFormValues
  submitLabel: string
}) {
  const [state, formAction] = useActionState(action, { error: null })

  return (
    <EnterToNextForm action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="room_number">部屋番号 *</Label>
        <Input id="room_number" name="room_number" required
          defaultValue={values?.room_number ?? ''} placeholder="101" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="layout">間取り</Label>
        <Input id="layout" name="layout"
          defaultValue={values?.layout ?? ''} placeholder="1LDK" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rent">賃料(円)</Label>
          <Input id="rent" name="rent" type="number"
            defaultValue={values?.rent ?? ''} placeholder="60000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other_fee">その他費用(円)</Label>
          <Input id="other_fee" name="other_fee" type="number"
            defaultValue={values?.other_fee ?? ''} placeholder="5000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parking_number">駐車場番号(P番号)</Label>
        <Input id="parking_number" name="parking_number"
          defaultValue={values?.parking_number ?? ''} placeholder="1 / なし" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guarantee_company">保証会社</Label>
        <Input id="guarantee_company" name="guarantee_company"
          defaultValue={values?.guarantee_company ?? ''} />
      </div>

      

      <div className="flex justify-end gap-2 pt-2">
        <Button asChild variant="outline" type="button">
          <LoadingLink href={backHref}>キャンセル</LoadingLink>
        </Button>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </EnterToNextForm>
  )
}