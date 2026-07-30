import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'

export async function getAccessLogs() {
  const me = await getMyAccount()
  if (!me || me.role !== ROLE.SYSTEM) return null

  const admin = createAdminClient()

  const { data: logs } = await admin
    .from('t900_access_log')
    .select('log_id, org_id, account_id, screen_id, access_datetime, leave_datetime, duration_seconds')
    .order('access_datetime', { ascending: false })
    .limit(500)

  const { data: orgs } = await admin
    .from('m100_organizations')
    .select('org_id, org_name')
    .eq('mukou_kbn', 0)
    .order('org_name')
  const { data: accounts } = await admin
    .from('m110_account')
    .select('account_id, name')

  const orgMap = new Map((orgs ?? []).map((o) => [o.org_id, o.org_name]))
  const accountMap = new Map((accounts ?? []).map((a) => [a.account_id, a.name]))

  return {
    logs: (logs ?? []).map((l) => ({
      ...l,
      org_name: orgMap.get(l.org_id) ?? '',
      account_name: accountMap.get(l.account_id) ?? '',
    })),
    orgs: orgs ?? [],   // プルダウン用
  }
}