import Link from 'next/link'
import { getSettingsInfo } from '@/features/queries/settings'
import { sendPasswordReset } from '@/features/actions/lv900_settings'
import { BackLink } from '@/components/common/BackLink'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE, ROLE_LABEL } from '@/constants/kbn'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const { reset } = await searchParams
  const info = await getSettingsInfo()
  if (!info) return null

  const isAdmin = info.account.role === 'admin'

  const role = info.account.role
  const isSystem = role === ROLE.SYSTEM
  const isAdminOrAbove = role === ROLE.ADMIN || role === ROLE.SYSTEM

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 border-b py-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? '—'}</span>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.SETTINGS} />
      <div>
        <BackLink href="/" label="メインメニューへ" />
        <h1 className="text-xl font-semibold">設定</h1>
      </div>

      {reset === 'sent' && (
        <div className="rounded-md border border-green-600/40 bg-green-50 p-3 text-sm text-green-800">
          パスワード再設定用のメールを送信しました。メール内のリンクから変更してください。
        </div>
      )}

      {/* 自分の情報 */}
      <Card>
        <CardHeader><CardTitle className="text-base">自分の情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="py-0">
            {row('氏名', info.account.name)}
            {row('メールアドレス', info.email)}
            {row('権限', (
              <Badge variant={isSystem ? 'destructive' : role === ROLE.ADMIN ? 'default' : 'secondary'}>
                {ROLE_LABEL[role]}
              </Badge>
            ))}
          </div>
          <form action={sendPasswordReset}>
            <Button type="submit" variant="outline" size="sm">
              パスワード再設定メールを送る
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 組織情報 */}
      <Card>
        <CardHeader><CardTitle className="text-base">組織情報</CardTitle></CardHeader>
        <CardContent className="py-0">
          {row('組織名', info.org?.org_name)}
          {row('アカウント数', `${info.accountCount} / ${info.org?.max_accounts ?? '—'}`)}
          {row('契約機能', (
            <div className="flex flex-wrap justify-end gap-1">
              {info.features.map((f) => (
                <Badge key={f.code} variant="outline">{f.name}</Badge>
              ))}
              {info.features.length === 0 && '—'}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 管理者向け */}
      {isAdminOrAbove && (
        <Card>
          <CardHeader><CardTitle className="text-base">管理者メニュー</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/settings/accounts">アカウント管理</Link>
            </Button>
            {/* アクセスログはシステム管理者のみ */}
            {isSystem && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/settings/logs">アクセスログ</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}