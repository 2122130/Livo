import Link from 'next/link'
import { getCustomFields } from '@/features/queries/custom-fields'
import { getChangeHistory } from '@/features/queries/history'
import { ChangeHistory } from '@/components/common/ChangeHistory'
import { CustomFieldRows } from '@/components/common/CustomFieldRows'
import { FileText } from 'lucide-react'
import type { CustomValues } from '@/lib/custom-fields'
import { getSaleBukkenDetail } from '@/features/queries/sale'
import {
  BUKKEN_CATEGORY_LABEL, TRADE_STATUS_LABEL,
  MANAGEMENT_TYPE_LABEL, TRANSACTION_TYPE_LABEL, LAND_STATUS_LABEL,
} from '@/constants/kbn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

// 詳細項目の表示定義(種別ごと)
function DetailRows({ category, detail }: { category: number; detail: Record<string, unknown> }) {
  const row = (label: string, value: unknown, unit = '') =>
    value != null && value !== '' ? (
      <div className="flex justify-between border-b py-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{String(value)}{unit}</span>
      </div>
    ) : null

  if (category === 1) return <>
    {row('間取り', detail.floor_plan)}
    {row('専有面積', detail.exclusive_area, '㎡')}
  </>
  if (category === 2) return <>
    {row('利回り', detail.yield_rate, '%')}
    {row('延床面積', detail.total_floor_area, '㎡')}
    {row('土地面積', detail.land_area, '㎡')}
  </>
  if (category === 3) return <>
    {row('間取り', detail.floor_plan)}
    {row('延床面積', detail.total_floor_area, '㎡')}
    {row('土地面積', detail.land_area, '㎡')}
  </>
  if (category === 4) return <>
    {row('土地面積', detail.land_area, '㎡')}
    {row('現況', detail.current_status != null ? LAND_STATUS_LABEL[detail.current_status as number] : null)}
  </>
  return null
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const [b, customFields, history] = await Promise.all([
    getSaleBukkenDetail(bukkenId),
    getCustomFields('sale'),
    getChangeHistory(bukkenId, [
      'm300_sale_bukken', 'm301_sale_bukken_mansion', 'm302_sale_bukken_apartment',
      'm303_sale_bukken_house', 'm304_sale_bukken_land',
    ]),
  ])

  const row = (label: string, value: unknown, unit = '') =>
    value != null && value !== '' ? (
      <div className="flex justify-between border-b py-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{String(value)}{unit}</span>
      </div>
    ) : null

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.SALE_DETAIL} />
      <div>
        <PageHeader title={b.bukken_name ?? '(名称未設定)'} backHref="/bukken?tab=sale" backLabel="売買一覧へ"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={`/documents/sale/${bukkenId}`}><FileText className="mr-1 h-4 w-4" />書類を作成</Link>
            </Button>
          } />
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline">{BUKKEN_CATEGORY_LABEL[b.bukken_category]}</Badge>
        {b.trade_status != null && (
          <Badge variant={b.trade_status === 1 ? 'default' : 'secondary'}>
            {TRADE_STATUS_LABEL[b.trade_status]}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
        <CardContent className="py-0">
          {row('価格', b.price != null ? b.price.toLocaleString() : null, '円')}
          {row('管理区分', MANAGEMENT_TYPE_LABEL[b.management_type])}
          {row('取引態様', b.transaction_type != null ? TRANSACTION_TYPE_LABEL[b.transaction_type] : null)}
          {row('所在地', b.address)}
          <CustomFieldRows fields={customFields} values={b.custom_fields as CustomValues} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{BUKKEN_CATEGORY_LABEL[b.bukken_category]}の詳細</CardTitle></CardHeader>
        <CardContent className="py-0">
          <DetailRows category={b.bukken_category} detail={b.detail} />
        </CardContent>
      </Card>

      <ChangeHistory rows={history} customFields={customFields} />
    </div>
  )
}