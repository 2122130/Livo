import Link from 'next/link'
import { getRentalBukken } from '@/features/queries/rental'
import { createRoom } from '@/features/actions/lv111_room_new'
import { RoomForm } from '../_RoomForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function RoomNewPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const bukken = await getRentalBukken(bukkenId)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <AccessLogger screenId={SCREEN.ROOM_NEW} />
      <div>
        <PageHeader title="部屋の登録" subtitle={`物件: ${bukken.bukken_name}`} backHref={`/bukken/rental/${bukkenId}/rooms`} backLabel="一覧へ戻る" />
      </div>
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