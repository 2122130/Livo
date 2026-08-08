'use client'

import { X } from 'lucide-react'

export function DeleteImageButton({ action }: { action: () => void }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('この写真を削除しますか?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        aria-label="削除"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  )
}