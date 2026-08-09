'use client'

import { useActionState } from 'react'
import { updateMyPassword } from '@/features/actions/lv900_settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/common/SubmitButton'

export function PasswordForm() {
  const [state, formAction] = useActionState(updateMyPassword, { error: null, success: false })

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">パスワードの変更</p>
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-emerald-600/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          パスワードを変更しました
        </div>
      )}
      <div className="space-y-1">
        <Input id="password" name="password" type="password" required />
      </div>
      <SubmitButton>パスワードを変更する</SubmitButton>
    </form>
  )
}