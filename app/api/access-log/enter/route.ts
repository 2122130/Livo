import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyAccount } from '@/features/auth/get-my-account'

export async function POST(request: NextRequest) {
  const account = await getMyAccount()
  if (!account) return NextResponse.json({ ok: false }, { status: 401 })

  const { log_id, screen_id, device_info, entered_at } = await request.json()
  const supabase = await createClient()

  await supabase.from('t900_access_log').insert({
    log_id,                          // クライアント生成のIDをそのまま使う
    org_id: account.org_id,
    account_id: account.account_id,
    screen_id,
    device_info: device_info ?? null,
    access_datetime: entered_at,     // クライアントの入室時刻
    create_account: account.name,
  })

  return NextResponse.json({ ok: true })
}