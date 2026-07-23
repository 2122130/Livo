import { createClient } from '@/lib/supabase/server'

export type EnabledFeature = {
  feature_code: string
  feature_name: string
  sort_order: number
}

export async function getEnabledFeatures(): Promise<EnabledFeature[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('m130_org_feature')
    .select('feature_code, m120_feature(feature_name, sort_order)')
    .eq('enabled', true)
    .eq('mukou_kbn', 0)

  const list = (data ?? []).map((row) => {
    // m120_featureはネストして返る
    const feature = row.m120_feature as unknown as {
      feature_name: string
      sort_order: number
    }
    return {
      feature_code: row.feature_code,
      feature_name: feature.feature_name,
      sort_order: feature.sort_order,
    }
  })

  return list.sort((a, b) => a.sort_order - b.sort_order)
}