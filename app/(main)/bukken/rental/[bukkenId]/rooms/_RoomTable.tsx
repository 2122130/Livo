'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { ROOM_STATUS_LABEL } from '@/constants/kbn'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Row = {
  room_id: string
  room_number: string
  room_status: number
  layout: string | null
  rent: number | null
  other_fee: number | null
  parking_number: string | null
  guarantee_company: string | null
}

type SortKey = 'room_number' | 'room_status' | 'layout' | 'rent' | 'other_fee' | 'parking_number' | 'guarantee_company'

export function RoomTable({ rows, bukkenId }: { rows: Row[]; bukkenId: string }) {
  const [sortKey, setSortKey] = useState<SortKey>('room_number')
  const [asc, setAsc] = useState(true)

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (av < bv) return asc ? -1 : 1
    if (av > bv) return asc ? 1 : -1
    return 0
  })

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc(!asc)
    else { setSortKey(key); setAsc(true) }
  }
  const arrow = (key: SortKey) => (sortKey === key ? (asc ? ' ▲' : ' ▼') : '')

  const th = (key: SortKey, label: string) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(key)}>
      {label}{arrow(key)}
    </TableHead>
  )

  const statusBadge = (status: number) => {
    const variant = status === 2 ? 'default' : status === 3 ? 'outline' : 'secondary'
    return <Badge variant={variant as 'default' | 'outline' | 'secondary'}>{ROOM_STATUS_LABEL[status]}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* PC: テーブル表示(md以上) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {th('room_number', '部屋番号')}
              {th('room_status', '状態')}
              {th('layout', '間取り')}
              {th('rent', '賃料')}
              {th('other_fee', 'その他費用')}
              {th('parking_number', 'P番号')}
              {th('guarantee_company', '保証会社')}
              <TableHead className="w-16 text-center">編集</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  登録された部屋がありません
                </TableCell>
              </TableRow>
            )}
            {sorted.map((r) => (
              <TableRow key={r.room_id}>
                <TableCell className="p-0">
                  <Link href={`/bukken/rental/${bukkenId}/rooms/${r.room_id}`} className="block px-4 py-3 font-medium hover:underline">
                    {r.room_number}
                  </Link>
                </TableCell>
                <TableCell>{statusBadge(r.room_status)}</TableCell>
                <TableCell>{r.layout ?? '—'}</TableCell>
                <TableCell>{r.rent != null ? `${r.rent.toLocaleString()}円` : '—'}</TableCell>
                <TableCell>{r.other_fee != null ? `${r.other_fee.toLocaleString()}円` : '—'}</TableCell>
                <TableCell>{r.parking_number ?? '—'}</TableCell>
                <TableCell>{r.guarantee_company ?? '—'}</TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/bukken/rental/${bukkenId}/rooms/${r.room_id}/edit`}>編集</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* スマホ: カード表示(md未満) */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-muted-foreground">
            登録された部屋がありません
          </p>
        )}
        {sorted.map((r) => (
          <div
            key={r.room_id}
            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all active:scale-[0.99] hover:border-emerald-300 hover:shadow-md"
          >
            {/* カード全体タップで部屋詳細へ */}
            <Link
              href={`/bukken/rental/${bukkenId}/rooms/${r.room_id}`}
              className="absolute inset-0 z-0 rounded-xl"
              aria-label={`部屋 ${r.room_number} の詳細へ`}
            />

            {/* 上段: 部屋番号 + 状態 */}
            <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
              <h3 className="text-lg font-bold text-slate-900 truncate">{r.room_number}</h3>
              <div className="shrink-0">{statusBadge(r.room_status)}</div>
            </div>

            {/* 情報 */}
            <dl className="relative z-10 mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm pointer-events-none">
              <dt className="text-muted-foreground">間取り</dt>
              <dd>{r.layout ?? '—'}</dd>
              <dt className="text-muted-foreground">賃料</dt>
              <dd>{r.rent != null ? `${r.rent.toLocaleString()}円` : '—'}</dd>
              <dt className="text-muted-foreground">その他費用</dt>
              <dd>{r.other_fee != null ? `${r.other_fee.toLocaleString()}円` : '—'}</dd>
              <dt className="text-muted-foreground">P番号</dt>
              <dd>{r.parking_number ?? '—'}</dd>
              <dt className="text-muted-foreground">保証会社</dt>
              <dd>{r.guarantee_company ?? '—'}</dd>
            </dl>

            {/* 修正ボタン */}
            <div className="relative z-10 mt-3 flex justify-end">
              <Button asChild variant="outline" size="sm" className="pointer-events-auto">
                <Link href={`/bukken/rental/${bukkenId}/rooms/${r.room_id}/edit`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  修正
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
