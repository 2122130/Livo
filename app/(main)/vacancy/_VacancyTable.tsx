'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Row = {
  room_id: string
  bukken_id: string
  bukken_name: string
  room_number: string
  layout: string | null
  rent: number | null
  other_fee: number | null
  parking_number: string | null
  bukken_address: string | null
}

type SortKey = 'bukken_name' | 'room_number' | 'layout' | 'rent' | 'other_fee' | 'parking_number' | 'bukken_address'

export function VacancyTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('bukken_name')
  const [asc, setAsc] = useState(true)
  const [bukkenKeyword, setBukkenKeyword] = useState('')
  const [layoutKeyword, setLayoutKeyword] = useState('')
  const [rentMax, setRentMax] = useState('')

  const filtered = rows.filter((r) => {
    if (bukkenKeyword && !r.bukken_name.includes(bukkenKeyword)) return false
    if (layoutKeyword && !(r.layout ?? '').includes(layoutKeyword)) return false
    if (rentMax && (r.rent == null || r.rent > Number(rentMax))) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
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
    <TableHead key={key} className="cursor-pointer select-none" onClick={() => toggleSort(key)}>
      {label}{arrow(key)}
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* 検索条件 */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>物件名</Label>
              <Input value={bukkenKeyword} onChange={(e) => setBukkenKeyword(e.target.value)} placeholder="キーワード" />
            </div>
            <div className="space-y-1">
              <Label>間取り</Label>
              <Input value={layoutKeyword} onChange={(e) => setLayoutKeyword(e.target.value)} placeholder="1LDK" />
            </div>
            <div className="space-y-1">
              <Label>賃料上限(円)</Label>
              <Input type="number" value={rentMax} onChange={(e) => setRentMax(e.target.value)} placeholder="80000" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setBukkenKeyword(''); setLayoutKeyword(''); setRentMax('') }}
            >
              条件をクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{sorted.length}件</p>

      {/* PC: テーブル表示(md以上) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {th('bukken_name', '物件名')}
              {th('room_number', '部屋番号')}
              {th('layout', '間取り')}
              {th('rent', '賃料')}
              {th('other_fee', 'その他費用')}
              {th('parking_number', 'P番号')}
              {th('bukken_address', '所在地')}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  該当する空室がありません
                </TableCell>
              </TableRow>
            )}
            {sorted.map((r) => (
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

      {/* スマホ: カード表示(md未満) — モックデザイン */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-muted-foreground">
            該当する空室がありません
          </p>
        )}
        {sorted.map((r) => (
          <Link
            key={r.room_id}
            href={`/bukken/rental/${r.bukken_id}/rooms/${r.room_id}?from=vacancy`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all active:scale-[0.99] hover:border-emerald-300 hover:shadow-md"
          >
            {/* 上段: 部屋番号(大) + 物件名(小) を左 / 空室バッジ を右 */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{r.room_number}</h3>
                <p className="mt-0.5 text-xs text-slate-500 truncate">{r.bukken_name}</p>
              </div>
              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                空室
              </span>
            </div>

            {/* 中段: 間取り・P番号(左) / 賃料(右・大) */}
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-xs text-slate-500">
                {r.layout ?? '—'}
                {r.parking_number && <span className="ml-2">／ P: {r.parking_number}</span>}
              </div>
              <div className="text-right leading-none">
                <span className="text-lg font-bold text-slate-900">
                  {r.rent != null ? `${r.rent.toLocaleString()}円` : '—'}
                </span>
                {r.other_fee != null && r.other_fee > 0 && (
                  <span className="ml-1 text-xs text-slate-400">+{r.other_fee.toLocaleString()}円</span>
                )}
              </div>
            </div>

            {/* 所在地 */}
            {r.bukken_address && (
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 border-t border-slate-100 pt-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{r.bukken_address}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
