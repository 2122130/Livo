'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = { process_code: number; status_kbn: number; end_date: string | null }
type Row = {
  tenancy_id: string
  tenant_name: string
  move_in_date: string
  move_out_date: string | null
  bikou: string | null
  steps: Step[]
}
type Process = { process_code: number; process_name: string; sort_order: number }

export function TenancyTable({
  rows,
  processes,
  updateBikou,
}: {
  rows: Row[]
  processes: Process[]
  updateBikou: (tenancyId: string, formData: FormData) => void
}) {
  // 工程を実施順に並べる(列見出し用)
  const orderedProcesses = [...processes].sort((a, b) => a.sort_order - b.sort_order)

  // 各入居行の、指定工程の完了日を返す
  const cellForProcess = (steps: Step[], code: number) => {
    const step = steps.find((s) => s.process_code === code)
    if (!step) return '—'
    return step.status_kbn === 2 ? (step.end_date ?? '完了') : '作業中'
  }

  return (
    <div className="rounded-md border bg-background overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>入居者</TableHead>
            <TableHead>入居日</TableHead>
            <TableHead>退去日</TableHead>
            {orderedProcesses.map((p) => (
              <TableHead key={p.process_code}>{p.process_name}</TableHead>
            ))}
            <TableHead className="min-w-[220px]">備考</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4 + orderedProcesses.length} className="text-center text-muted-foreground">
                入居履歴がありません
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.tenancy_id}>
              <TableCell className="font-medium">{r.tenant_name}</TableCell>
              <TableCell>{r.move_in_date}</TableCell>
              <TableCell>{r.move_out_date ?? '入居中'}</TableCell>
              {orderedProcesses.map((p) => (
                <TableCell key={p.process_code}>
                  {cellForProcess(r.steps, p.process_code)}
                </TableCell>
              ))}
              <TableCell>
                <BikouCell
                  tenancyId={r.tenancy_id}
                  value={r.bikou ?? ''}
                  updateBikou={updateBikou}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// 備考のインライン編集セル
function BikouCell({
  tenancyId,
  value,
  updateBikou,
}: {
  tenancyId: string
  value: string
  updateBikou: (tenancyId: string, formData: FormData) => void
}) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{value || '—'}</span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>編集</Button>
      </div>
    )
  }

  return (
    <form action={updateBikou.bind(null, tenancyId)} className="flex items-center gap-2">
      <Input name="bikou" defaultValue={value} className="h-8" />
      <Button type="submit" size="sm">保存</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>取消</Button>
    </form>
  )
}