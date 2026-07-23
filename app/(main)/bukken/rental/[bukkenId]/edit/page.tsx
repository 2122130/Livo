import Link from 'next/link'
import { getRentalBukken } from '@/features/queries/rental'
import { updateRentalBukken, deleteRentalBukken } from '@/features/actions/lv101_rental_new'
import { BukkenForm } from '../../_BukkenForm'
import { DeleteButton } from './_DeleteButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RentalEditPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const bukken = await getRentalBukken(bukkenId)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">賃貸物件の編集</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/bukken?tab=rental">一覧へ戻る</Link>
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">物件情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <BukkenForm
            action={updateRentalBukken.bind(null, bukkenId)}
            backHref="/bukken?tab=rental"
            values={bukken}
            submitLabel="更新する"
          />
          {/* 削除ボタンを更新ボタン行の左端に重ねる */}
          <div className="-mt-[52px] w-fit">
            <DeleteButton action={deleteRentalBukken.bind(null, bukkenId)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}