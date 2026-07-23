export const FEATURE = {
  RENTAL: 'RENTAL',
  SALE: 'SALE',
  SOLAR: 'SOLAR',
} as const

// feature_code → 遷移先ルート
export const FEATURE_ROUTE: Record<string, string> = {
  RENTAL: '/rental',
  SALE: '/sale',
  SOLAR: '/solar',
}