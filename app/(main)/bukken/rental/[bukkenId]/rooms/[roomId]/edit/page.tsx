import Link from 'next/link'
import { getRoomDetail, getRentalBukken } from '@/features/queries/rental'
import { updateRoom, deleteRoom } from '@/features/actions/lv111_room_new'
import { RoomForm } from '../../_RoomForm'
import { DeleteButton } from './_DeleteButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'

export default async function RoomEditPage({
  params,
}: {
  params: Promise<{ bukkenId: string; roomId: string }>
}) {
  const { bukkenId, roomId } = await params
  const [bukken, room] = await Promise.all([
    getRentalBukken(bukkenId),
    getRoomDetail(roomId),
  ])

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <AccessLogger screenId={SCREEN.ROOM_EDIT} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">部屋の編集</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/bukken/rental/${bukkenId}/rooms`}>一覧へ戻る</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">物件: {bukken.bukken_name}</p>
      <Card>
        <CardHeader><CardTitle className="text-base">部屋情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RoomForm
            action={updateRoom.bind(null, roomId, bukkenId)}
            backHref={`/bukken/rental/${bukkenId}/rooms`}
            values={room}
            submitLabel="更新する"
          />
          {/* 削除ボタンを更新ボタン行の左端に重ねる */}
          <div className="-mt-[52px] w-fit">
            <DeleteButton action={deleteRoom.bind(null, roomId, bukkenId)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}