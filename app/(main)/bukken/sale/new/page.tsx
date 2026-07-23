import Link from 'next/link'
import { createSaleBukken } from '@/features/actions/lv201_sale_new'
import { SaleForm } from '../_SaleForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SaleNewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">売買物件の登録</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/bukken?tab=sale">一覧へ戻る</Link>
        </Button>
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