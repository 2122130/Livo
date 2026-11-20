import { getSaleBukkenDetail } from '@/features/queries/sale'
import { getCustomFields } from '@/features/queries/custom-fields'
import { getMyOrgName } from '@/features/queries/org'
import {
  BUKKEN_CATEGORY_LABEL, TRADE_STATUS_LABEL, MANAGEMENT_TYPE_LABEL,
  TRANSACTION_TYPE_LABEL, LAND_STATUS_LABEL,
} from '@/constants/kbn'
import { formatCustomValue, type CustomValues } from '@/lib/custom-fields'
import { DocumentSheet, DocSection, DocTable } from '@/components/common/DocumentSheet'

const num = (v: unknown, unit: string) =>
  v === null || v === undefined || v === '' ? null : `${Number(v).toLocaleString()}${unit}`

// 売買物件の物件概要書
export default async function SaleDocumentPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const [b, fields, orgName] = await Promise.all([
    getSaleBukkenDetail(bukkenId),
    getCustomFields('sale'),
    getMyOrgName(),
  ])
  const d = b.detail as Record<string, unknown>

  return (
    <DocumentSheet
      title="物件概要書(売買)"
      orgName={orgName}
      backHref={`/bukken/sale/${bukkenId}`}
      backLabel="物件詳細へ戻る"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xl font-bold">{b.bukken_name ?? '(名称未設定)'}</p>
          {b.address && <p className="text-slate-600">{b.address}</p>}
        </div>
        <div className="rounded border-2 border-slate-800 px-4 py-2 text-right">
          <div className="text-xs text-slate-500">価格</div>
          <div className="text-2xl font-bold">{num(b.price, '円') ?? '要相談'}</div>
        </div>
      </div>

      <DocSection title="物件の情報">
        <DocTable rows={[
          ['種別', BUKKEN_CATEGORY_LABEL[b.bukken_category]],
          ['所在地', b.address],
          ['価格', num(b.price, '円')],
          ['間取り', d.floor_plan as string | null],
          ['専有面積', num(d.exclusive_area, '㎡')],
          ['延床面積', num(d.total_floor_area, '㎡')],
          ['土地面積', num(d.land_area, '㎡')],
          ['利回り', num(d.yield_rate, '%')],
          ['現況', d.current_status != null ? LAND_STATUS_LABEL[d.current_status as number] : null],
          ...fields.map((f): [string, string | null] => [
            f.label, formatCustomValue(f, (b.custom_fields as CustomValues | undefined)?.[f.field_id]),
          ]),
        ]} />
      </DocSection>

      <DocSection title="取引条件">
        <DocTable rows={[
          ['取引態様', b.transaction_type != null ? TRANSACTION_TYPE_LABEL[b.transaction_type] : null],
          ['状態', b.trade_status != null ? TRADE_STATUS_LABEL[b.trade_status] : null],
          ['管理区分', MANAGEMENT_TYPE_LABEL[b.management_type]],
        ]} />
      </DocSection>

      <p className="pt-4 text-xs text-slate-500">
        ※ 記載内容は作成日時点のものです。現況と異なる場合は現況を優先します。
      </p>
    </DocumentSheet>
  )
}
