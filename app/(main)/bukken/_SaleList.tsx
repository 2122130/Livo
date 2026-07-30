'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BUKKEN_CATEGORY_LABEL, TRADE_STATUS_LABEL } from '@/constants/kbn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { MANAGEMENT_TYPE_LABEL, TRANSACTION_TYPE_LABEL } from '@/constants/kbn'
import { LAND_STATUS_LABEL } from '@/constants/kbn'

type Row = {
  bukken_id: string
  bukken_category: number
  bukken_name: string | null
  trade_status: number | null
  management_type: number
  price: number | null
  address: string | null
  detail: Record<string, unknown>
}

// 種別ごとの固有列: 見出しと、各物件から値を取り出す関数
const EXTRA_COLUMNS: Record<number, { label: string; get: (d: Record<string, unknown>) => string }[]> = {
  1: [ // マンション
    { label: '間取り', get: (d) => (d.floor_plan as string) ?? '—' },
    { label: '専有面積', get: (d) => d.exclusive_area != null ? `${d.exclusive_area}㎡` : '—' },
  ],
  2: [ // アパート
    { label: '利回り', get: (d) => d.yield_rate != null ? `${d.yield_rate}%` : '—' },
    { label: '延床面積', get: (d) => d.total_floor_area != null ? `${d.total_floor_area}㎡` : '—' },
    { label: '土地面積', get: (d) => d.land_area != null ? `${d.land_area}㎡` : '—' },
  ],
  3: [ // 戸建て
    { label: '間取り', get: (d) => (d.floor_plan as string) ?? '—' },
    { label: '延床面積', get: (d) => d.total_floor_area != null ? `${d.total_floor_area}㎡` : '—' },
    { label: '土地面積', get: (d) => d.land_area != null ? `${d.land_area}㎡` : '—' },
  ],
  4: [ // 土地
    { label: '土地面積', get: (d) => d.land_area != null ? `${d.land_area}㎡` : '—' },
    { label: '現況', get: (d) => d.current_status != null ? LAND_STATUS_LABEL[d.current_status as number] : '—' },
  ],
}



// 種別の表示順
const CATEGORY_ORDER = [1, 2, 3, 4] // マンション/アパート/戸建て/土地

export function SaleList({ rows }: { rows: Row[] }) {
  const [category, setCategory] = useState<number | 'all'>('all')
  const [status, setStatus] = useState<number | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  // 絞り込み
  const filtered = rows.filter((r) => {
    if (category !== 'all' && r.bukken_category !== category) return false
    if (status !== 'all' && r.trade_status !== status) return false
    if (keyword && !(r.bukken_name ?? '').includes(keyword)) return false
    return true
  })

  // 表示する種別(「すべて」なら全種別、絞ったらその種別だけ)
  const shownCategories = category === 'all' ? CATEGORY_ORDER : [category]

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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">すべて</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{BUKKEN_CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>状態</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">すべて</option>
                <option value={1}>募集中</option>
                <option value={2}>売却</option>
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
              onClick={() => { setCategory('all'); setStatus('all'); setKeyword('') }}
            >
              条件をクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 種別ごとのグループカード(各カード内はテーブル) */}
      {shownCategories.map((cat) => {
        const items = filtered.filter((r) => r.bukken_category === cat)
        const extraCols = EXTRA_COLUMNS[cat] ?? []

        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-base">
                {BUKKEN_CATEGORY_LABEL[cat]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {items.length}件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTable category={cat} items={items} extraCols={extraCols} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


function CategoryTable({
  category,
  items,
  extraCols,
}: {
  category: number
  items: Row[]
  extraCols: { label: string; get: (d: Record<string, unknown>) => string }[]
}) {
  const hasBuildingName = category === 1 || category === 2

  // ソート状態(このテーブル専用)
  const [sortKey, setSortKey] = useState<string>(hasBuildingName ? 'bukken_name' : 'address')
  const [asc, setAsc] = useState(true)

  // ソート用の値を取り出す
  const getSortValue = (r: Row, key: string): string | number => {
    if (key === 'bukken_name') return r.bukken_name ?? ''
    if (key === 'address') return r.address ?? ''
    if (key === 'trade_status') return r.trade_status ?? 0
    if (key === 'price') return r.price ?? 0
    // 固有列は detail から取る(表示文字列でソート)
    const col = extraCols.find((c) => c.label === key)
    if (col) return col.get(r.detail)
    return ''
  }

  const sorted = [...items].sort((a, b) => {
    const av = getSortValue(a, sortKey)
    const bv = getSortValue(b, sortKey)
    if (av < bv) return asc ? -1 : 1
    if (av > bv) return asc ? 1 : -1
    return 0
  })

  const toggleSort = (key: string) => {
    if (key === sortKey) setAsc(!asc)
    else { setSortKey(key); setAsc(true) }
  }
  const arrow = (key: string) => (sortKey === key ? (asc ? ' ▲' : ' ▼') : '')
  const th = (key: string, label: string) => (
    <TableHead key={key} className="cursor-pointer select-none" onClick={() => toggleSort(key)}>
      {label}{arrow(key)}
    </TableHead>
  )

  return (
    <div className="rounded-md border bg-background overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {hasBuildingName ? th('bukken_name', '物件名') : th('address', '所在地')}
            {th('trade_status', '状態')}
            {th('price', '価格')}
            {extraCols.map((c) => th(c.label, c.label))}
            {hasBuildingName && (
              <TableHead
                key="address-last"
                className="cursor-pointer select-none"
                onClick={() => toggleSort('address')}
              >
                所在地{arrow('address')}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={3 + extraCols.length + (hasBuildingName ? 1 : 0)}
                className="text-center text-muted-foreground">
                該当する物件がありません
              </TableCell>
            </TableRow>
          )}
          {sorted.map((r) => (
            <TableRow key={r.bukken_id}>
              <TableCell className="p-0">
                <Link href={`/bukken/sale/${r.bukken_id}`}
                  className="block px-4 py-3 font-medium hover:underline">
                  {hasBuildingName
                    ? (r.bukken_name ?? '(名称未設定)')
                    : (r.address ?? '(所在地未設定)')}
                </Link>
              </TableCell>
              <TableCell>
                {r.trade_status != null ? (
                  <Badge variant={r.trade_status === 1 ? 'default' : 'secondary'}>
                    {TRADE_STATUS_LABEL[r.trade_status]}
                  </Badge>
                ) : '—'}
              </TableCell>
              <TableCell>
                {r.price != null ? `${r.price.toLocaleString()}円` : '—'}
              </TableCell>
              {extraCols.map((c) => (
                <TableCell key={c.label}>{c.get(r.detail)}</TableCell>
              ))}
              {hasBuildingName && <TableCell>{r.address ?? '—'}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}