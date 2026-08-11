'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/common/Modal'
import { SubmitButton } from '@/components/common/SubmitButton'

export function MoveInModal({ action }: { action: (formData: FormData) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <LogIn className="mr-1 h-4 w-4" />
        入居させる
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="入居登録" maxWidth="max-w-md">
        <form action={action} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="tenant_name">入居者名 *</Label>
            <Input id="tenant_name" name="tenant_name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="move_in_date">入居日 *</Label>
            <Input id="move_in_date" name="move_in_date" type="date" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bikou">備考</Label>
            <Input id="bikou" name="bikou" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
            <SubmitButton>入居を記録</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}