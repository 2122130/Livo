'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TAIOU_KBN_LABEL, TAIOU_STATUS_LABEL
} from '@/constants/kbn'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Row = {
  taiou_id: string
  bukken_kbn: number
  bukken_name: string
  room_number: string | null
  taiou_kbn: number
  status_kbn: number
  uketsuke_date: string
  customer_name: string | null
  title: string | null
  bikou: string | null
  uketsuke_name: string
  tantou_name: string | null
}

type SortKey = 'status_kbn' | 'uketsuke_date' | 'uketsuke_name' | 'bukken_name' | 'customer_name' | 'title' | 'tantou_name' | 'bikou'

// 'YYYY-MM-DD' → 'YYYY/MM/DD'
function formatDate(d: string) {
  return d.replaceAll('-', '/')
}

// 受付日からの経過日数
function daysElapsed(d: string) {
  const from = new Date(d)
  const today = new Date()
  from.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export function InquiryTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('status_kbn')
  const [asc, setAsc] = useState(true)
  const [status, setStatus] = useState<number | 'all'>('all')
  const [taiouKbn, setTaiouKbn] = useState<number | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = rows.filter((r) => {
    if (status !== 'all' && r.status_kbn !== status) return false
    if (taiouKbn !== 'all' && r.taiou_kbn !== taiouKbn) return false
    if (keyword) {
      const hit = r.bukken_name.includes(keyword) || (r.customer_name ?? '').includes(keyword)
      if (!hit) return false
    }
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

  const statusBadge = (s: number) => {
    const variant = s === 3 ? 'secondary' : s === 2 ? 'default' : 'outline'
    return <Badge variant={variant as 'default' | 'outline' | 'secondary'}>{TAIOU_STATUS_LABEL[s]}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* 検索条件 */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>進捗</Label>
              <select value={status}
                onChange={(e) => setStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm">
                <option value="all">すべて</option>
                {Object.entries(TAIOU_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>対応区分</Label>
              <select value={taiouKbn}
                onChange={(e) => setTaiouKbn(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm">
                <option value="all">すべて</option>
                {Object.entries(TAIOU_KBN_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>キーワード(物件名・相談者名)</Label>
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm"
              onClick={() => { setStatus('all'); setTaiouKbn('all'); setKeyword('') }}>
              条件をクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{sorted.length}件</p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {th('status_kbn', '進捗')}
              {th('uketsuke_date', '受付日')}
              {th('uketsuke_name', '受付者')}
              {th('bukken_name', '物件名-部屋')}
              {th('customer_name', '依頼者')}
              {th('title', '件名')}
              {th('tantou_name', '担当者')}
              {th('bikou', '備考')}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  該当する対応履歴がありません
                </TableCell>
              </TableRow>
            )}
            {sorted.map((r) => (
              <TableRow key={r.taiou_id}>
                <TableCell>{statusBadge(r.status_kbn)}</TableCell>
                <TableCell className="p-0 whitespace-nowrap">
                  <Link href={`/inquiries/${r.taiou_id}/edit`}
                    className="block px-4 py-3 font-medium hover:underline">
                    {formatDate(r.uketsuke_date)}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {daysElapsed(r.uketsuke_date)}日経過
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{r.uketsuke_name}</TableCell>
                <TableCell>
                  {r.bukken_name}
                  {r.room_number && `-${r.room_number}`}
                </TableCell>
                <TableCell>{r.customer_name ?? '—'}</TableCell>
                <TableCell>
                  <span className="mr-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                    {TAIOU_KBN_LABEL[r.taiou_kbn]}
                  </span>
                  {r.title ?? '(件名なし)'}
                </TableCell>
                <TableCell>{r.tantou_name ?? '未アサイン'}</TableCell>
                <TableCell className="max-w-[200px] truncate">{r.bikou ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}