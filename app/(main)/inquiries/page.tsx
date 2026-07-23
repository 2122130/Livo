import Link from 'next/link'
import { getTaiouRirekiList } from '@/features/queries/inquiries'
import { BackLink } from '@/components/common/BackLink'
import { InquiryTable } from './_InquiryTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="space-y-4">
      <div>
        <BackLink href="/" label="メインメニューへ" />
        <h1 className="text-xl font-semibold">対応履歴</h1>
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="rental" asChild>
            <Link href="/inquiries?tab=rental">賃貸</Link>
          </TabsTrigger>
          <TabsTrigger value="sale" asChild>
            <Link href="/inquiries?tab=sale">売買</Link>
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
      </Tabs>
    </div>
  )
}