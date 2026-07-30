import Link from 'next/link'
import { getRentalBukken, getRoomsByBukken } from '@/features/queries/rental'
import { RoomTable } from './_RoomTable'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/common/BackLink'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ bukkenId: string }>
}) {
  const { bukkenId } = await params
  const [bukken, rooms] = await Promise.all([
    getRentalBukken(bukkenId),
    getRoomsByBukken(bukkenId),
  ])

  return (
    <div className="space-y-4">
      <AccessLogger screenId={SCREEN.ROOM_LIST} />
        <div>
          <PageHeader
            title={`部屋一覧 - ${bukken.bukken_name}`}
            backHref="/bukken?tab=rental"
            backLabel="物件一覧へ"
            action={
              <Button asChild size="sm">
                <Link href={`/bukken/rental/${bukkenId}/rooms/new`}>＋ 部屋を登録</Link>
              </Button>
            }
          />
        </div>

      <RoomTable rows={rooms} bukkenId={bukkenId} />
    </div>
  )
}