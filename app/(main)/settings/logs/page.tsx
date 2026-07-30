import { redirect } from 'next/navigation'
import { getAccessLogs } from '@/features/queries/logs'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'
import { BackLink } from '@/components/common/BackLink'
import { LogTable } from './_LogTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LogsPage() {
  const me = await getMyAccount()
  if (!me) redirect('/login')
  if (me.role !== ROLE.SYSTEM) redirect('/settings')

  const data = await getAccessLogs()
  if (!data) redirect('/settings')

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <BackLink href="/settings" label="設定へ" />
        <h1 className="text-xl font-semibold">アクセスログ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            アクセス履歴
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              直近{data.logs.length}件
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LogTable logs={data.logs} orgs={data.orgs} />
        </CardContent>
      </Card>
    </div>
  )
}