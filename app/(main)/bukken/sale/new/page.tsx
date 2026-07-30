import Link from 'next/link'
import { createSaleBukken } from '@/features/actions/lv201_sale_new'
import { SaleForm } from '../_SaleForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default function SaleNewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.SALE_NEW} />
      <div>
        <PageHeader title="売買物件の登録" backHref="/bukken?tab=sale" backLabel="一覧へ戻る" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">物件情報</CardTitle></CardHeader>
        <CardContent>
          <SaleForm
            action={createSaleBukken}
            backHref="/bukken?tab=sale"
            submitLabel="登録する"
          />
        </CardContent>
      </Card>
    </div>
  )
}