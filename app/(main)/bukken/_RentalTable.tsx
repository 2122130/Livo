'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Pencil } from 'lucide-react'
import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE_LABEL } from '@/constants/kbn'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingLink } from '@/components/common/LoadingLink'

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
  const [category, setCategory] = useState<number | 'all'>('all')
  const [management, setManagement] = useState<number | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = rows.filter((r) => {
    if (category !== 'all' && r.bukken_category !== category) return false
    if (management !== 'all' && r.management_type !== management) return false
    if (keyword && !r.bukken_name.includes(keyword)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
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
    <div className="space-y-4">
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

      <p className="text-sm text-muted-foreground">該当: {sorted.length}件 / 総数: {rows.length}件</p>

      {/* PC: テーブル表示(md以上) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                  <LoadingLink href={`/bukken/rental/${b.bukken_id}/rooms`} className="block px-4 py-3 font-medium hover:underline">
                    {b.bukken_name}
                  </LoadingLink >
                </TableCell>
                <TableCell>{BUKKEN_CATEGORY_LABEL[b.bukken_category]}</TableCell>
                <TableCell>{MANAGEMENT_TYPE_LABEL[b.management_type]}</TableCell>
                <TableCell>{b.vacant_units}/{b.total_units}</TableCell>
                <TableCell>{b.address ?? '—'}</TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="outline" size="sm">
                    <LoadingLink href={`/bukken/rental/${b.bukken_id}/edit`}>編集</LoadingLink>
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
            登録された賃貸物件がありません
          </p>
        )}
        {sorted.map((b) => (
          <div
            key={b.bukken_id}
            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all active:scale-[0.99] hover:border-emerald-300 hover:shadow-md"
          >
            {/* カード全体をタップ可能にする透明リンク(修正ボタンの下に敷く) */}
            <LoadingLink
              href={`/bukken/rental/${b.bukken_id}/rooms`}
              className="absolute inset-0 z-0 rounded-xl"
              aria-label={`${b.bukken_name} の部屋一覧へ`}
            />

            {/* 上段: 物件名 + 空室数 */}
            <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{b.bukken_name}</h3>
                {/* タグ */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                    {BUKKEN_CATEGORY_LABEL[b.bukken_category]}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                    {MANAGEMENT_TYPE_LABEL[b.management_type]}
                  </span>
                </div>
              </div>
              {/* 空室/総戸数 */}
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-400 font-medium">空室 / 総戸数</p>
                <p className="leading-none">
                  <span className={`text-2xl font-bold ${b.vacant_units > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {b.vacant_units}
                  </span>
                  <span className="text-sm text-slate-400 font-medium"> / {b.total_units}</span>
                </p>
              </div>
            </div>

            {/* 所在地 */}
            <div className="relative z-10 mt-2 flex items-center gap-1 text-xs text-slate-500 pointer-events-none">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{b.address ?? '所在地未設定'}</span>
            </div>

            {/* 修正ボタン(カードリンクより前面。独立して遷移) */}
            <div className="relative z-10 mt-3 flex justify-end">
              <Button asChild variant="outline" size="sm" className="pointer-events-auto">
                <LoadingLink href={`/bukken/rental/${b.bukken_id}/edit`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  修正
                </LoadingLink>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
