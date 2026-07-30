import Link from 'next/link'
import { getSaleBukkenDetail } from '@/features/queries/sale'
import { updateSaleBukken, deleteSaleBukken } from '@/features/actions/lv201_sale_new'
import { SaleForm } from '../../_SaleForm'
import { DeleteButton } from './_DeleteButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function SaleEditPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const b = await getSaleBukkenDetail(bukkenId)

  // 共通項目 + 詳細を、_SaleForm の初期値の形にまとめる
  const values = {
    bukken_category: b.bukken_category,
    bukken_name: b.bukken_name,
    trade_status: b.trade_status,
    management_type: b.management_type,
    price: b.price,
    address: b.address,
    transaction_type: b.transaction_type,
    ...b.detail, // floor_plan, exclusive_area など種別詳細
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.SALE_EDIT} />
      <div>
        <PageHeader title="売買物件の編集" backHref={`/bukken/sale/${bukkenId}`} backLabel="詳細へ戻る" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">物件情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SaleForm
            action={updateSaleBukken.bind(null, bukkenId, b.bukken_category)}
            backHref={`/bukken/sale/${bukkenId}`}
            values={values}
            submitLabel="更新する"
            categoryLocked
          />
          {/* 削除ボタンを更新ボタン行の左端に重ねる */}
          <div className="-mt-[52px] w-fit">
            <DeleteButton action={deleteSaleBukken.bind(null, bukkenId)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}