'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    const supabase = createClient()
    // メールのリンクで既に認証セッションがあるので、パスワードを更新できる
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。')
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-emerald-700 text-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <span className="font-semibold tracking-wide">不動産管理システム</span>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>パスワードの再設定</CardTitle></CardHeader>
          <CardContent>
            {done ? (
              <div className="space-y-4">
                <p className="text-sm text-emerald-700">
                  パスワードを変更しました。新しいパスワードでログインしてください。
                </p>
                <Button className="w-full" onClick={() => router.push('/login')}>
                  ログイン画面へ
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="password">新しいパスワード</Label>
                  <Input id="password" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm">新しいパスワード(確認)</Label>
                  <Input id="confirm" type="password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '更新中...' : 'パスワードを変更する'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}