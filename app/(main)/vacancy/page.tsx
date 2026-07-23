import Link from 'next/link'
import { getVacantRooms } from '@/features/queries/rental'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BackLink } from '@/components/common/BackLink'

export default async function VacancyPage() {
  const rooms = await getVacantRooms()

  return (
    <div className="space-y-4">
      <div>
        <BackLink href="/" label="メインメニューへ" />
        <h1 className="text-xl font-semibold">空室管理</h1>
        <p className="text-sm text-muted-foreground">
          現在空室の部屋を一覧表示しています(全{rooms.length}件)
        </p>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>物件名</TableHead>
              <TableHead>部屋番号</TableHead>
              <TableHead>間取り</TableHead>
              <TableHead>賃料</TableHead>
              <TableHead>その他費用</TableHead>
              <TableHead>P番号</TableHead>
              <TableHead>所在地</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  現在空室はありません
                </TableCell>
              </TableRow>
            )}
            {rooms.map((r) => (
              <TableRow key={r.room_id}>
                <TableCell>{r.bukken_name}</TableCell>
                <TableCell className="p-0">
                  <Link
                    href={`/bukken/rental/${r.bukken_id}/rooms/${r.room_id}?from=vacancy`}
                    className="block px-4 py-3 font-medium hover:underline"
                    >
                    {r.room_number}
                  </Link>
                </TableCell>
                <TableCell>{r.layout ?? '—'}</TableCell>
                <TableCell>{r.rent != null ? `${r.rent.toLocaleString()}円` : '—'}</TableCell>
                <TableCell>{r.other_fee != null ? `${r.other_fee.toLocaleString()}円` : '—'}</TableCell>
                <TableCell>{r.parking_number ?? '—'}</TableCell>
                <TableCell>{r.bukken_address ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}