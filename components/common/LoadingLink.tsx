'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { ComponentProps } from 'react'
import { createPortal } from 'react-dom'

function LinkLoadingOverlay() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  if (typeof document === 'undefined') return null

  // body直下に描画(ボタンのスタイルに影響されない)
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-8 py-6 shadow-lg backdrop-blur-md">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-medium text-slate-700">Loading...</p>
      </div>
    </div>,
    document.body
  )
}

export function LoadingLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <LinkLoadingOverlay />
    </Link>
  )
}