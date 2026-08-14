'use client'

import { useFormStatus } from 'react-dom'

export function LoadingOverlay() {
  const { pending } = useFormStatus()
  if (!pending) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-medium text-slate-700">Loading...</p>
      </div>
    </div>
  )
}