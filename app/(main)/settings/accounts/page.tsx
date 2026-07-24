import { redirect } from 'next/navigation'
import { getAccountList } from '@/features/queries/accounts'
import { getMyAccount } from '@/features/auth/get-my-account'
import { createAccount } from '@/features/actions/lv900_settings'
import { ROLE, ROLE_LABEL } from '@/constants/kbn'
import { BackLink } from '@/components/common/BackLink'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  const { created } = await searchParams
  const me = await getMyAccount()
  if (!me) redirect('/login')

  // admin または system のみアクセス可
  if (me.role !== ROLE.ADMIN && me.role !== ROLE.SYSTEM) {
    redirect('/settings')
  }

  const data = await getAccountList()
  if (!data) redirect('/login')

  const isSystem = data.isSystem

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <BackLink href="/settings" label="設定へ" />
        <h1 className="text-xl font-semibold">アカウント管理</h1>
      </div>

      {created === '1' && (
        <div className="rounded-md border border-green-600/40 bg-green-50 p-3 text-sm text-green-800">
          招待メールを送信しました。相手がメールからパスワードを設定するとログインできます。
        </div>
      )}

      {/* 新規アカウント作成 */}
      <Card>
        <CardHeader><CardTitle className="text-base">アカウントを追加</CardTitle></CardHeader>
        <CardContent>
          <form action={createAccount} className="space-y-4">
            {/* システム管理者のみ組織を選択 */}
            {isSystem && (
              <div className="space-y-1">
                <Label htmlFor="org_id">組織 *</Label>
                <select id="org_id" name="org_id" required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">選択してください</option>
                  {data.orgs.map((o) => (
                    <option key={o.org_id} value={o.org_id}>{o.org_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">氏名 *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>

            {/* システム管理者は権限を選べる。adminは一般固定 */}
            {isSystem ? (
              <div className="space-y-1">
                <Label htmlFor="role">権限 *</Label>
                <select id="role" name="role" required defaultValue={ROLE.MEMBER}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value={ROLE.ADMIN}>{ROLE_LABEL.admin}</option>
                  <option value={ROLE.MEMBER}>{ROLE_LABEL.member}</option>
                </select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                権限: 一般(管理者アカウントの発行はシステム管理者にご依頼ください)
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit">招待メールを送る</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* アカウント一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            アカウント一覧
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {data.accounts.length}件
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  {isSystem && <TableHead>組織</TableHead>}
                  <TableHead>氏名</TableHead>
                  <TableHead>権限</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isSystem ? 3 : 2} className="text-center text-muted-foreground">
                      アカウントがありません
                    </TableCell>
                  </TableRow>
                )}
                {data.accounts.map((a) => (
                  <TableRow key={a.account_id}>
                    {isSystem && <TableCell>{a.org_name}</TableCell>}
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        a.role === ROLE.SYSTEM ? 'destructive'
                        : a.role === ROLE.ADMIN ? 'default' : 'secondary'
                      }>
                        {ROLE_LABEL[a.role]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}