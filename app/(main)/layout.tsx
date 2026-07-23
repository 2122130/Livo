import Link from 'next/link'
import { Home } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getMyAccount } from '@/features/auth/get-my-account'


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
          {/* タイトルをメインメニューへのリンクに */}
          <Link href="/" className="font-semibold hover:opacity-70">
            不動産管理システム
          </Link>
          <span className="text-sm text-muted-foreground">{account.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}