import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'

export async function getAccountList() {
  const me = await getMyAccount()
  if (!me) return null

  const isSystem = me.role === ROLE.SYSTEM

  if (isSystem) {
    // システム管理者: 全組織のアカウントをservice roleで取得
    const admin = createAdminClient()
    const { data: accounts } = await admin
      .from('m110_account')
      .select('account_id, org_id, name, role, auth_user_id')
      .eq('mukou_kbn', 0)
      .order('org_id')

    const { data: orgs } = await admin
      .from('m100_organizations')
      .select('org_id, org_name, max_accounts')
      .eq('mukou_kbn', 0)
      .order('org_name')

    const orgMap = new Map((orgs ?? []).map((o) => [o.org_id, o]))

    return {
      isSystem: true,
      accounts: (accounts ?? []).map((a) => ({
        ...a,
        org_name: orgMap.get(a.org_id)?.org_name ?? '',
      })),
      orgs: orgs ?? [],          // 組織選択用
      maxAccounts: null,         // systemは組織をまたぐのでnull
    }
  }

  // 管理者: 自組織のみ(通常クライアント=RLSで自組織に限定される)
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from('m110_account')
    .select('account_id, org_id, name, role, auth_user_id')
    .eq('mukou_kbn', 0)
    .order('name')

  const { data: org } = await supabase
    .from('m100_organizations')
    .select('org_id, org_name, max_accounts')
    .eq('org_id', me.org_id)
    .single()

    console.log('DEBUG org:', org, 'me.role:', me.role)

  return {
    isSystem: false,
    accounts: (accounts ?? []).map((a) => ({
      ...a,
      org_name: org?.org_name ?? '',
    })),
    orgs: org ? [org] : [],
    maxAccounts: org?.max_accounts ?? null,
  }
}