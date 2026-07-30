import Link from 'next/link'
import { createRentalBukken } from '@/features/actions/lv101_rental_new'
import { BukkenForm } from '../_BukkenForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default function RentalNewPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <AccessLogger screenId={SCREEN.RENTAL_NEW} />
      <div>
        <PageHeader title="賃貸物件の登録" backHref="/bukken?tab=rental" backLabel="一覧へ戻る" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">物件情報</CardTitle></CardHeader>
        <CardContent>
          <BukkenForm
            action={createRentalBukken}
            backHref="/bukken?tab=rental"
            submitLabel="登録する"
          />
        </CardContent>
      </Card>
    </div>
  )
}