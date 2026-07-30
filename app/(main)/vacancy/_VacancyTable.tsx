'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  // 検索条件
  const [bukkenKeyword, setBukkenKeyword] = useState('')
  const [layoutKeyword, setLayoutKeyword] = useState('')
  const [rentMax, setRentMax] = useState('')

  // 絞り込み
  const filtered = rows.filter((r) => {
    if (bukkenKeyword && !r.bukken_name.includes(bukkenKeyword)) return false
    if (layoutKeyword && !(r.layout ?? '').includes(layoutKeyword)) return false
    if (rentMax && (r.rent == null || r.rent > Number(rentMax))) return false
    return true
  })

  // ソート
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

      {/* 件数 */}
      <p className="text-sm text-muted-foreground">{sorted.length}件</p>

      {/* テーブル */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
    </div>
  )
}