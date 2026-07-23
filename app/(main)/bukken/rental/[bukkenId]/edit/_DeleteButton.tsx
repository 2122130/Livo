'use client'
'use client'
import { Button } from '@/components/ui/button'

export function DeleteButton({ action }: { action: () => void }) {
  return (
    <form action={action}>
      <Button type="submit" variant="destructive">削除する</Button>
    </form>
  )
}