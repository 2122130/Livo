import { getVacantRooms } from '@/features/queries/rental'
import { BackLink } from '@/components/common/BackLink'
import { VacancyTable } from './_VacancyTable'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function VacancyPage() {
  const rooms = await getVacantRooms()

  return (
    <div className="space-y-4">
      <AccessLogger screenId={SCREEN.VACANCY} />

      
      <div>
        <PageHeader
         title="空室管理"
         subtitle="現在空室の部屋を一覧表示"
         backHref="/" backLabel="メインメニューへ"
        />
        <p className="text-sm text-muted-foreground">
          現在空室の部屋を一覧表示しています
        </p>
      </div>

      <VacancyTable rows={rooms} />
    </div>
  )
}