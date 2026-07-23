import { createClient } from '@/lib/supabase/server'

export async function getSettingsInfo() {
  const supabase = await createClient()

  // ログイン中ユーザー(メールアドレスはauth側から取得)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 自分のアカウント情報
  const { data: account } = await supabase
    .from('m110_account')
    .select('account_id, org_id, name, role')
    .eq('auth_user_id', user.id)
    .eq('mukou_kbn', 0)
    .single()
  if (!account) return null

  // 組織情報
  const { data: org } = await supabase
    .from('m100_organizations')
    .select('org_id, org_name, max_accounts')
    .eq('org_id', account.org_id)
    .single()

  // 組織内のアカウント数
  const { data: accounts } = await supabase
    .from('m110_account')
    .select('account_id')
    .eq('mukou_kbn', 0)

  // 契約している機能
  const { data: features } = await supabase
    .from('m130_org_feature')
    .select('feature_code, m120_feature(feature_name, sort_order)')
    .eq('enabled', true)
    .eq('mukou_kbn', 0)

  const featureList = (features ?? []).map((f) => {
    const m = f.m120_feature as unknown as { feature_name: string; sort_order: number }
    return { code: f.feature_code, name: m.feature_name, sort: m.sort_order }
  }).sort((a, b) => a.sort - b.sort)

  return {
    email: user.email ?? '',
    account,
    org: org ?? null,
    accountCount: (accounts ?? []).length,
    features: featureList,
  }
}