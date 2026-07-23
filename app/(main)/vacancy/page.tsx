import { getVacantRooms } from '@/features/queries/rental'
import { BackLink } from '@/components/common/BackLink'
import { VacancyTable } from './_VacancyTable'

export default async function VacancyPage() {
  const rooms = await getVacantRooms()

  return (
    <div className="space-y-4">
      <div>
        <BackLink href="/" label="メインメニューへ" />
        <h1 className="text-xl font-semibold">空室管理</h1>
        <p className="text-sm text-muted-foreground">
          現在空室の部屋を一覧表示しています
        </p>
      </div>

      <VacancyTable rows={rooms} />
    </div>
  )
}