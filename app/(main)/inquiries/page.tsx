import Link from 'next/link'
import { getTaiouRirekiList } from '@/features/queries/inquiries'
import { BackLink } from '@/components/common/BackLink'
import { InquiryTable } from './_InquiryTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'
import { getEnabledFeatures } from '@/features/features-flag/api'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'
import { LoadingLink } from '@/components/common/LoadingLink'

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams

  const [rows, features, account] = await Promise.all([
    getTaiouRirekiList(),
    getEnabledFeatures(),
    getMyAccount(),
  ])
  const isSystem = account?.role === ROLE.SYSTEM
  const codes = features.map((f) => f.feature_code)
  const hasRental = isSystem || codes.includes('RENTAL')
  const hasSale = isSystem || codes.includes('SALE')
  const hasSolar = isSystem || codes.includes('SOLAR')

  const rentalRows = rows.filter((r) => r.bukken_kbn === 1)
  const saleRows = rows.filter((r) => r.bukken_kbn === 2)
  const solarRows = rows.filter((r) => r.bukken_kbn === 3)

  // 契約タブのうち、URLのtabが無効なら先頭にフォールバック
  const availableTabs = [
    hasRental && 'rental',
    hasSale && 'sale',
    hasSolar && 'solar',
  ].filter(Boolean) as string[]
  const activeTab = tab && availableTabs.includes(tab) ? tab : (availableTabs[0] ?? 'rental')

  return (
    <div className="space-y-4">
      <PageHeader title="対応履歴" backHref="/" backLabel="メインメニューへ" />

      <Tabs value={activeTab}>
        <TabsList className="bg-slate-100 p-1">
          {hasRental && (
            <TabsTrigger value="rental" asChild>
              <LoadingLink href="/inquiries?tab=rental"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">賃貸</LoadingLink
                >
            </TabsTrigger>
          )}
          {hasSale && (
            <TabsTrigger value="sale" asChild>
              <LoadingLink href="/inquiries?tab=sale"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">売買</LoadingLink>
            </TabsTrigger>
          )}
          {hasSolar && (
            <TabsTrigger value="solar" asChild>
              <LoadingLink href="/inquiries?tab=solar"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">太陽光</LoadingLink>
            </TabsTrigger>
          )}
        </TabsList>

        {hasRental && (
          <TabsContent value="rental" className="space-y-3">
            <div className="flex justify-end">
              <Button asChild size="sm"><LoadingLink href="/inquiries/new?kbn=1">＋ 対応履歴を登録(賃貸)</LoadingLink></Button>
            </div>
            <InquiryTable rows={rentalRows} />
          </TabsContent>
        )}

        {hasSale && (
          <TabsContent value="sale" className="space-y-3">
            <div className="flex justify-end">
              <Button asChild size="sm"><LoadingLink href="/inquiries/new?kbn=2">＋ 対応履歴を登録(売買)</LoadingLink></Button>
            </div>
            <InquiryTable rows={saleRows} />
          </TabsContent>
        )}

        {hasSolar && (
          <TabsContent value="solar" className="space-y-3">
            <div className="flex justify-end">
              <Button asChild size="sm"><LoadingLink href="/inquiries/new?kbn=3">＋ 対応履歴を登録(太陽光)</LoadingLink></Button>
            </div>
            <InquiryTable rows={solarRows} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}