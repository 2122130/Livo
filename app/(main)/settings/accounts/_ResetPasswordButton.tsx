'use client'

import { useState } from 'react'
import { resetMemberPassword } from '@/features/actions/lv900_settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ResetPasswordButton({ accountId, accountName }: { accountId: string; accountName: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (password.length < 6) { setMessage('6文字以上で入力してください'); return }
    setLoading(true)
    const fd = new FormData()
    fd.set('password', password)
    const result = await resetMemberPassword(accountId, fd)
    setLoading(false)
    if (result.error) setMessage(result.error)
    else { setMessage('リセットしました'); setPassword('') }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        パスワードリセット
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`${accountName}の新パスワード`}
          className="h-8 w-44 text-sm"
        />
        <Button size="sm" onClick={handleReset} disabled={loading}>
          {loading ? '...' : '設定'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setMessage(null); setPassword('') }}>
          取消
        </Button>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}