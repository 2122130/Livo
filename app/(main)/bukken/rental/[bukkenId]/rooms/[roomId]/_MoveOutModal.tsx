'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/common/Modal'
import { SubmitButton } from '@/components/common/SubmitButton'

export function MoveOutModal({
  action,
  tenantName,
  prepProcessNames,
}: {
  action: (formData: FormData) => void
  tenantName: string
  prepProcessNames: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <LogOut className="mr-1 h-4 w-4" />
        退去させる
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="退去登録" maxWidth="max-w-md">
        <form action={action} className="space-y-3">
          <p className="text-sm text-muted-foreground">現在の入居者: {tenantName}</p>
          <div className="space-y-1">
            <Label htmlFor="move_out_date">退去日 *</Label>
            <Input id="move_out_date" name="move_out_date" type="date" required />
          </div>
          <p className="text-xs text-muted-foreground">
            退去すると準備工程({prepProcessNames})が自動で作成されます。全工程を完了すると空室に戻ります。
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
            <SubmitButton>退去して準備開始</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}