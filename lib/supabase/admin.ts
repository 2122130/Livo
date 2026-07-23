import { createClient } from '@supabase/supabase-js'

// service roleキーを使用。RLSを貫通するため、サーバー内の限定用途のみ。
// 'use client'のファイルからは絶対にimportしないこと。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}