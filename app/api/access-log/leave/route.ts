import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

export async function POST(request: NextRequest) {
  const account = await getMyAccount()
  if (!account) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { log_id } = await request.json()
  const supabase = await createClient()

  await supabase
    .from('t900_access_log')
    .update({ leave_datetime: new Date().toISOString(), update_account: account.name })
    .eq('log_id', log_id)

  return NextResponse.json({ ok: true })
}