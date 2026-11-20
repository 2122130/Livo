import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

// 書類に載せる自社名
export async function getMyOrgName(): Promise<string | null> {
  const account = await getMyAccount()
  if (!account) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('m100_organizations')
    .select('org_name')
    .eq('org_id', account.org_id)
    .maybeSingle()
  return data?.org_name ?? null
}

// アカウントID → 名前(履歴・書類の表示用)
export async function getAccountNameMap(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('m110_account')
    .select('account_id, name')
  return Object.fromEntries((data ?? []).map((a) => [String(a.account_id), a.name]))
}
