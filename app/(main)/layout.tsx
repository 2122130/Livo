import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMyAccount } from '@/features/auth/get-my-account'
import { logout } from '@/features/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { ROLE_LABEL } from '@/constants/kbn'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  function roleBadgeClass(role: string) {
    if (role === 'system') return 'bg-rose-100 text-rose-700'      // システム管理者
    if (role === 'admin') return 'bg-amber-100 text-amber-700'     // 管理者
    return 'bg-white/20 text-white'                                 // 一般
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-emerald-700 text-white shadow-sm print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide hover:opacity-80">
            <img src="/logos/Livo_logo丸.png" alt="Livo" className="h-8 w-8 object-contain" />
            Livo
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* 権限バッジ */}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(account.role)}`}>
                {ROLE_LABEL[account.role]}
              </span>
              {/* 名前 */}
              <span className="text-sm text-white/90">{account.name}</span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon"
                className="text-white hover:bg-white/15 hover:text-white" title="ログアウト">
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