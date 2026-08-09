'use client'

import { useState } from 'react'

export function ForgotPasswordModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-emerald-700 hover:underline"
      >
        パスワードをお忘れの方
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">パスワードの再設定について</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">一般アカウントの方</p>
                <p className="mt-1 text-muted-foreground">
                  ご所属の組織の管理者アカウントから、パスワードの再設定を行ってください。
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">管理者アカウントの方</p>
                <p className="mt-1 text-muted-foreground">
                  開発元までご連絡ください。
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}