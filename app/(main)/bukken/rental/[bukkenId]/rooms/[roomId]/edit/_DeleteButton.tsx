'use client'

import { Button } from '@/components/ui/button'

export function DeleteButton({ action }: { action: () => void }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('この部屋を削除します。よろしいですか?')) {
          e.preventDefault()
        }
      }}
    >
      <Button type="submit" variant="destructive">削除する</Button>
    </form>
  )
}