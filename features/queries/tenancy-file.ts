import { createClient } from '@/lib/supabase/server'

export type TenancyFile = {
  file_id: string
  tenancy_id: string
  file_category: number   // 1:契約書 2:写真
  storage_path: string
  file_name: string | null
  url: string | null      // 署名付きURL(表示・DL用)
}

// 指定入居のファイルを署名付きURL付きで取得
export async function getTenancyFiles(tenancyId: string): Promise<TenancyFile[]> {
  const supabase = await createClient()

  const { data: files } = await supabase
    .from('t280_tenancy_file')
    .select('file_id, tenancy_id, file_category, storage_path, file_name, sort_order')
    .eq('tenancy_id', tenancyId)
    .eq('mukou_kbn', 0)
    .order('file_category')
    .order('sort_order')

  if (!files || files.length === 0) return []

  const withUrls = await Promise.all(
    files.map(async (f) => {
      const { data } = await supabase.storage
        .from('tenancy-files')
        .createSignedUrl(f.storage_path, 3600)
      return {
        file_id: f.file_id,
        tenancy_id: f.tenancy_id,
        file_category: f.file_category,
        storage_path: f.storage_path,
        file_name: f.file_name,
        url: data?.signedUrl ?? null,
      }
    })
  )

  return withUrls
}

// 複数入居のファイルをまとめて取得(入居履歴の展開用)
// tenancy_idごとにまとめたMapを返す
export async function getTenancyFilesMap(tenancyIds: string[]): Promise<Record<string, TenancyFile[]>> {
  if (tenancyIds.length === 0) return {}
  const supabase = await createClient()

  const { data: files } = await supabase
    .from('t280_tenancy_file')
    .select('file_id, tenancy_id, file_category, storage_path, file_name, sort_order')
    .in('tenancy_id', tenancyIds)
    .eq('mukou_kbn', 0)
    .order('file_category')
    .order('sort_order')

  if (!files || files.length === 0) return {}

  const result: Record<string, TenancyFile[]> = {}
  await Promise.all(
    files.map(async (f) => {
      const { data } = await supabase.storage
        .from('tenancy-files')
        .createSignedUrl(f.storage_path, 3600)
      const item: TenancyFile = {
        file_id: f.file_id,
        tenancy_id: f.tenancy_id,
        file_category: f.file_category,
        storage_path: f.storage_path,
        file_name: f.file_name,
        url: data?.signedUrl ?? null,
      }
      if (!result[f.tenancy_id]) result[f.tenancy_id] = []
      result[f.tenancy_id].push(item)
    })
  )

  return result
}