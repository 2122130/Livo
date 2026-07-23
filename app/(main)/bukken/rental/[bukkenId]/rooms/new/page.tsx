import Link from 'next/link'
import { getRentalBukken } from '@/features/queries/rental'
import { createRoom } from '@/features/actions/lv111_room_new'
import { RoomForm } from '../_RoomForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RoomNewPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const bukken = await getRentalBukken(bukkenId)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">部屋の登録</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/bukken/rental/${bukkenId}/rooms`}>一覧へ戻る</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">物件: {bukken.bukken_name}</p>
      <Card>
        <CardHeader><CardTitle className="text-base">部屋情報</CardTitle></CardHeader>
        <CardContent>
          <RoomForm
            action={createRoom.bind(null, bukkenId)}
            backHref={`/bukken/rental/${bukkenId}/rooms`}
            submitLabel="登録する"
          />
        </CardContent>
      </Card>
    </div>
  )
}