import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/common/SubmitButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hasError = params.error === '1'

  return (
    <div className="min-h-screen">
      {/* 深緑ヘッダー(システム名のみ) */}
      <header className="bg-emerald-700 text-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <span className="font-semibold tracking-wide">Livo</span>
        </div>
      </header>
      
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">ログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {hasError && (
                <p className="text-sm text-red-600">
                  メールアドレスまたはパスワードが正しくありません
                </p>
              )}
              <SubmitButton className="w-full">ログイン</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    
  )
}