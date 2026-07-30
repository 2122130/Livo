import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

// 入室記録(INSERT) → log_idを返す
export async function POST(request: NextRequest) {
  const account = await getMyAccount()
  if (!account) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { screen_id, device_info } = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('t900_access_log')
    .insert({
      org_id: account.org_id,
      account_id: account.account_id,
      screen_id,
      device_info: device_info ?? null,
      create_account: account.name,
    })
    .select('log_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ log_id: data.log_id })
}

// 退室記録(UPDATE leave_datetime)
export async function PATCH(request: NextRequest) {
  const account = await getMyAccount()
  if (!account) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { log_id } = await request.json()
  const supabase = await createClient()

  const { error } = await supabase
    .from('t900_access_log')
    .update({ leave_datetime: new Date().toISOString(), update_account: account.name })
    .eq('log_id', log_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}