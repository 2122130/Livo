import Link from 'next/link'
import { getTaiouRirekiList } from '@/features/queries/inquiries'
import { BackLink } from '@/components/common/BackLink'
import { InquiryTable } from './_InquiryTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab ?? 'rental'

  const rows = await getTaiouRirekiList()
  const rentalRows = rows.filter((r) => r.bukken_kbn === 1)
  const saleRows = rows.filter((r) => r.bukken_kbn === 2)
  const solarRows = rows.filter((r) => r.bukken_kbn === 3)

  return (
    <div className="space-y-4">
      <AccessLogger screenId={SCREEN.INQUIRY_LIST} />
      <div>
        <PageHeader title="対応履歴" backHref="/" backLabel="メインメニューへ" />
      </div>

      <Tabs value={activeTab}>
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="rental" asChild>
            <Link href="/inquiries?tab=rental"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">
              賃貸
            </Link>
          </TabsTrigger>
          <TabsTrigger value="sale" asChild>
            <Link href="/inquiries?tab=sale"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">
              売買
            </Link>
          </TabsTrigger>
          <TabsTrigger value="solar" asChild>
            <Link href="/inquiries?tab=solar"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-6">
              太陽光
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rental" className="space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/inquiries/new?kbn=1">＋ 対応履歴を登録(賃貸)</Link>
            </Button>
          </div>
          <InquiryTable rows={rentalRows} />
        </TabsContent>

        <TabsContent value="sale" className="space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/inquiries/new?kbn=2">＋ 対応履歴を登録(売買)</Link>
            </Button>
          </div>
          <InquiryTable rows={saleRows} />
        </TabsContent>

        <TabsContent value="solar" className="space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/inquiries/new?kbn=3">＋ 対応履歴を登録(太陽光)</Link>
            </Button>
          </div>
          <InquiryTable rows={solarRows} />
        </TabsContent>
      </Tabs>
    </div>
  )
}