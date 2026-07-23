import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMyAccount } from '@/features/auth/get-my-account'
import { logout } from '@/features/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold hover:opacity-70">
            不動産管理システム
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{account.name}</span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon" title="ログアウト">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}