import Link from 'next/link'
import { createRentalBukken } from '@/features/actions/lv101_rental_new'
import { BukkenForm } from '../_BukkenForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RentalNewPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">賃貸物件の登録</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/bukken?tab=rental">一覧へ戻る</Link>
        </Button>
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