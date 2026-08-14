'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <>
      <Button type="submit" disabled={pending} className={className}>
        {pending ? '処理中...' : children}
      </Button>

      {/* 送信中は画面中央にオーバーレイ */}
      {pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-8 py-6 shadow-lg backdrop-blur-md">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm font-medium text-slate-700">Loading...</p>
          </div>
        </div>
      )}
    </>
  )
}