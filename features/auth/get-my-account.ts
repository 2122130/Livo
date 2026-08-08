// src/features/auth/get-my-account.ts
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getMyAccount = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('m110_account')
    .select('account_id, org_id, role, name')
    .eq('auth_user_id', user.id)
    .eq('mukou_kbn', 0)
    .single()

  return data
})