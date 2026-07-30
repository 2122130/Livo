'use client'

import { useState } from 'react'
import { SCREEN_NAME } from '@/constants/screens'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'

type Log = {
  log_id: string
  org_id: string
  org_name: string
  account_name: string
  screen_id: string
  access_datetime: string
  leave_datetime: string | null
  duration_seconds: number | null
}

type Org = { org_id: string; org_name: string }

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function formatDuration(sec: number | null) {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

export function LogTable({ logs, orgs }: { logs: Log[]; orgs: Org[] }) {
  const [orgId, setOrgId] = useState<string>('all')

  const filtered = orgId === 'all' ? logs : logs.filter((l) => l.org_id === orgId)

  return (
    <div className="space-y-4">
      {/* 組織で絞り込み */}
      <div className="max-w-xs space-y-1">
        <Label>組織</Label>
        <select
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">すべての組織</option>
          {orgs.map((o) => (
            <option key={o.org_id} value={o.org_id}>{o.org_name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length}件</p>

      <div className="rounded-md border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>組織</TableHead>
              <TableHead>利用者</TableHead>
              <TableHead>画面</TableHead>
              <TableHead>入室</TableHead>
              <TableHead>退室</TableHead>
              <TableHead>滞在時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  アクセスログがありません
                </TableCell>
              </TableRow>
            )}
            {filtered.map((l) => (
              <TableRow key={l.log_id}>
                <TableCell>{l.org_name}</TableCell>
                <TableCell>{l.account_name}</TableCell>
                <TableCell>{SCREEN_NAME[l.screen_id] ?? l.screen_id}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(l.access_datetime)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(l.leave_datetime)}</TableCell>
                <TableCell>{formatDuration(l.duration_seconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}