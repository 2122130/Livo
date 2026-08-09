import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/common/SubmitButton'
import { ForgotPasswordModal } from './_ForgotPasswordModal'

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
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <span className="flex items-center gap-2 text-xl font-bold tracking-wide">
            <img src="/logos/Livo_logo丸.png" alt="Livo" className="h-8 w-8 object-contain" />
            Livo
          </span>
        </div>
      </header>
      
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-center">
            <img src="/logos/Livo_logo.png" alt="Livo" className="h-20 w-20 object-contain" />
          </div>
          
          <Card className="w-full">
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

                <div className="text-center">
                  <ForgotPasswordModal />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    
  )
}