import Link from 'next/link'
import { getRentalBukkenList } from '@/features/queries/rental'
import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL } from '@/constants/kbn'
import { RentalTable } from './_RentalTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getSaleBukkenList } from '@/features/queries/sale'
import { SaleList } from './_SaleList'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/common/BackLink'

export default async function BukkenPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab ?? 'rental'

  const rentalList = await getRentalBukkenList()

  const saleList = await getSaleBukkenList()

  return (
    <div className="space-y-4">
      <BackLink href="/" label="メインメニューへ" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">物件一覧</h1>
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="rental" asChild>
            <Link href="/bukken?tab=rental">賃貸</Link>
          </TabsTrigger>
          <TabsTrigger value="sale" asChild>
            <Link href="/bukken?tab=sale">売買</Link>
          </TabsTrigger>
        </TabsList>

        {/* 賃貸タブ */}
        <TabsContent value="rental" className="space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/bukken/rental/new">＋ 賃貸物件を登録</Link>
            </Button>
          </div>
          <RentalTable rows={rentalList} />
        </TabsContent>

        {/* 売買タブ(中身は後で実装) */}
        <TabsContent value="sale" className="space-y-3">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/bukken/sale/new">＋ 売買物件を登録</Link>
            </Button>
          </div>
          <SaleList rows={saleList} />
        </TabsContent>
      </Tabs>
    </div>
  )
}