'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toWareki } from '@/lib/date'
import { FileModal } from './_FileModal'
import { TenancyDetailModal } from './_TenancyDetailModal'

type Step = { prep_id: string; process_code: number; status_kbn: number; end_date: string | null }
type Row = {
  tenancy_id: string
  tenant_name: string
  move_in_date: string
  move_out_date: string | null
  bikou: string | null
  steps: Step[]
}
type Process = { process_code: number; process_name: string; sort_order: number }
type TenancyFile = {
  file_id: string
  file_category: number
  storage_path: string
  file_name: string | null
  url: string | null
}

export function TenancyTable({
  rows,
  processes,
  filesMap,
  roomId,
  bukkenId,
}: {
  rows: Row[]
  processes: Process[]
  filesMap: Record<string, TenancyFile[]>
  roomId: string
  bukkenId: string
}) {
  const orderedProcesses = [...processes].sort((a, b) => a.sort_order - b.sort_order)

  const cellForProcess = (steps: Step[], code: number) => {
    const step = steps.find((s) => s.process_code === code)
    if (!step) return '—'
    return step.status_kbn === 2 ? '済' : '作業中'
  }

  // 入居者+入居日+退去日+工程+備考+詳細+資料
  const totalCols = 6 + orderedProcesses.length

  return (
    <div className="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>入居者</TableHead>
            <TableHead>入居日</TableHead>
            <TableHead>退去日</TableHead>
            {orderedProcesses.map((p) => (
              <TableHead key={p.process_code}>{p.process_name}</TableHead>
            ))}
            <TableHead className="min-w-[180px]">備考</TableHead>
            <TableHead>詳細</TableHead>
            <TableHead>資料</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={totalCols} className="text-center text-muted-foreground">
                入居履歴がありません
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => {
            const files = filesMap[r.tenancy_id] ?? []
            return (
              <TableRow key={r.tenancy_id}>
                <TableCell className="font-medium">{r.tenant_name}</TableCell>
                <TableCell>{toWareki(r.move_in_date)}</TableCell>
                <TableCell>{r.move_out_date ? toWareki(r.move_out_date) : '入居中'}</TableCell>
                {orderedProcesses.map((p) => (
                  <TableCell key={p.process_code}>
                    {cellForProcess(r.steps, p.process_code)}
                  </TableCell>
                ))}
                <TableCell>{r.bikou || '—'}</TableCell>
                <TableCell>
                  <TenancyDetailModal
                    tenancyId={r.tenancy_id}
                    roomId={roomId}
                    bukkenId={bukkenId}
                    tenantName={r.tenant_name}
                    moveInDate={r.move_in_date}
                    moveOutDate={r.move_out_date}
                    bikou={r.bikou}
                    steps={r.steps}
                    processes={processes}
                  />
                </TableCell>
                <TableCell>
                  <FileModal
                    tenancyId={r.tenancy_id}
                    roomId={roomId}
                    bukkenId={bukkenId}
                    tenantName={r.tenant_name}
                    files={files}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
