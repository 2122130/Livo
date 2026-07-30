import Link from 'next/link'
import { getRentalBukkenList } from '@/features/queries/rental'
import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL } from '@/constants/kbn'
import { RentalTable } from './_RentalTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getSaleBukkenList } from '@/features/queries/sale'
import { SaleList } from './_SaleList'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/common/BackLink'
import { getEnabledFeatures } from '@/features/features-flag/api'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function BukkenPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams

  // 権限と契約機能を取得
  const [account, features] = await Promise.all([
    getMyAccount(),
    getEnabledFeatures(),
  ])
  const isSystem = account?.role === ROLE.SYSTEM

  // システム管理者は全機能、それ以外は契約している機能のみ
  const codes = features.map((f) => f.feature_code)
  const hasRental = isSystem || codes.includes('RENTAL')
  const hasSale = isSystem || codes.includes('SALE')
  const hasSolar = isSystem || codes.includes('SOLAR')

  // 以降は変更なし(availableTabs, activeTab, データ取得, JSX)
  const availableTabs = [
    hasRental && 'rental',
    hasSale && 'sale',
    hasSolar && 'solar',
  ].filter(Boolean) as string[]

  const activeTab = tab && availableTabs.includes(tab)
    ? tab
    : (availableTabs[0] ?? 'rental')

  const rentalList = hasRental ? await getRentalBukkenList() : []
  const saleList = hasSale ? await getSaleBukkenList() : []

  return (
    <div className="space-y-4">
      <AccessLogger screenId={activeTab === 'sale' ? SCREEN.BUKKEN_SALE : SCREEN.BUKKEN_RENTAL} />

      <PageHeader
        title="物件一覧"
        backHref="/"
        backLabel="メインメニューへ"
      />
      <Tabs value={activeTab}>
        <TabsList className="bg-slate-100 p-1">
          {hasRental && (
            <TabsTrigger value="rental" asChild>
              <Link href="/bukken?tab=rental"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">
                賃貸
              </Link>
            </TabsTrigger>
          )}
          {hasSale && (
            <TabsTrigger value="sale" asChild>
              <Link href="/bukken?tab=sale"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">
                売買
              </Link>
            </TabsTrigger>
          )}
        </TabsList>

        {hasRental && (
          <TabsContent value="rental" className="space-y-3">
            <div className="flex justify-end">
              <Button asChild size="sm">
                <Link href="/bukken/rental/new">＋ 賃貸物件を登録</Link>
              </Button>
            </div>
            <RentalTable rows={rentalList} />
          </TabsContent>
        )}

        {hasSale && (
          <TabsContent value="sale" className="space-y-3">
            <div className="flex justify-end">
              <Button asChild size="sm">
                <Link href="/bukken/sale/new">＋ 売買物件を登録</Link>
              </Button>
            </div>
            <SaleList rows={saleList} />
          </TabsContent>
        )}

        {hasSolar && (
          <TabsContent value="solar">
            <p className="text-sm text-muted-foreground">太陽光は準備中です。</p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}