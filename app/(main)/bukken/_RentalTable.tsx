'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL } from '@/constants/kbn'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type Row = {
  bukken_id: string
  bukken_name: string
  bukken_category: number
  management_type: number
  address: string | null
  total_units: number
  vacant_units: number
}

type SortKey = 'bukken_name' | 'bukken_category' | 'management_type' | 'vacancy' | 'address'

export function RentalTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('bukken_name')
  const [asc, setAsc] = useState(true)
  // 検索条件
  const [category, setCategory] = useState<number | 'all'>('all')
  const [management, setManagement] = useState<number | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = rows.filter((r) => {
    if (category !== 'all' && r.bukken_category !== category) return false
    if (management !== 'all' && r.management_type !== management) return false
    if (keyword && !r.bukken_name.includes(keyword)) return false
    return true
  })

  // 絞り込み後にソート
  const sorted = [...filtered].sort((a, b) => {
    // 中身は既存のまま
    let av: string | number = ''
    let bv: string | number = ''
    switch (sortKey) {
      case 'bukken_name': av = a.bukken_name; bv = b.bukken_name; break
      case 'bukken_category': av = a.bukken_category; bv = b.bukken_category; break
      case 'management_type': av = a.management_type; bv = b.management_type; break
      case 'vacancy': av = a.vacant_units; bv = b.vacant_units; break
      case 'address': av = a.address ?? ''; bv = b.address ?? ''; break
    }
    if (av < bv) return asc ? -1 : 1
    if (av > bv) return asc ? 1 : -1
    return 0
  })

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc(!asc)
    else { setSortKey(key); setAsc(true) }
  }

  const arrow = (key: SortKey) => (sortKey === key ? (asc ? ' ▲' : ' ▼') : '')

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* 検索条件 */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>種別</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="all">すべて</option>
                {Object.entries(BUKKEN_CATEGORY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>管理区分</Label>
              <select
                value={management}
                onChange={(e) => setManagement(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="all">すべて</option>
                {Object.entries(MANAGEMENT_TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>物件名</Label>
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="キーワード" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCategory('all'); setManagement('all'); setKeyword('') }}
            >
              条件をクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('bukken_name')}>物件名{arrow('bukken_name')}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('bukken_category')}>種別{arrow('bukken_category')}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('management_type')}>管理区分{arrow('management_type')}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('vacancy')}>空室数/総戸数{arrow('vacancy')}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('address')}>所在地{arrow('address')}</TableHead>
            <TableHead className="w-20 text-center">編集</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                登録された賃貸物件がありません
              </TableCell>
            </TableRow>
          )}
          {sorted.map((b) => (
            <TableRow key={b.bukken_id}>
              <TableCell className="p-0">
                <Link href={`/bukken/rental/${b.bukken_id}/rooms`} className="block px-4 py-3 font-medium hover:underline">
                  {b.bukken_name}
                </Link>
              </TableCell>
              <TableCell>{BUKKEN_CATEGORY_LABEL[b.bukken_category]}</TableCell>
              <TableCell>{MANAGEMENT_TYPE_LABEL[b.management_type]}</TableCell>
              <TableCell>{b.vacant_units}/{b.total_units}</TableCell>
              <TableCell>{b.address ?? '—'}</TableCell>
              <TableCell className="text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/bukken/rental/${b.bukken_id}/edit`}>編集</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}