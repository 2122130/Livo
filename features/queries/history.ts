import { createClient } from '@/lib/supabase/server'

export type HistoryRow = {
  history_id: string
  table_name: string
  record_id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: string | null
  changed_at: string
}

// 1件のデータ(物件・部屋・対応など)の変更履歴を新しい順に取得
export async function getChangeHistory(recordIds: string | string[], tables: string[], limit = 50): Promise<HistoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('t900_change_history')
    .select('history_id, table_name, record_id, operation, old_data, new_data, changed_by, changed_at')
    .in('record_id', (Array.isArray(recordIds) ? recordIds : [recordIds]).map(String))
    .in('table_name', tables)
    .order('changed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as HistoryRow[]
}
