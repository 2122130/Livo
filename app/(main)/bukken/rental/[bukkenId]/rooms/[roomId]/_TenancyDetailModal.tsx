'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/common/Modal'
import { SubmitButton } from '@/components/common/SubmitButton'
import { updateTenancyInfo, updatePrepStepDate } from '@/features/actions/lv110_room_detail'

type Step = { prep_id: string; process_code: number; status_kbn: number; end_date: string | null }
type Process = { process_code: number; process_name: string; sort_order: number }

export function TenancyDetailModal({
  tenancyId,
  roomId,
  bukkenId,
  tenantName,
  moveInDate,
  moveOutDate,
  bikou,
  steps,
  processes,
}: {
  tenancyId: string
  roomId: string
  bukkenId: string
  tenantName: string
  moveInDate: string
  moveOutDate: string | null
  bikou: string | null
  steps: Step[]
  processes: Process[]
}) {
  const [open, setOpen] = useState(false)

  const processName = (code: number) =>
    processes.find((p) => p.process_code === code)?.process_name ?? `工程${code}`

  const orderedSteps = [...steps].sort((a, b) => {
    const oa = processes.find((p) => p.process_code === a.process_code)?.sort_order ?? 0
    const ob = processes.find((p) => p.process_code === b.process_code)?.sort_order ?? 0
    return oa - ob
  })

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-1 h-3.5 w-3.5" />
        詳細
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="入居情報の詳細・修正">
        <div className="space-y-5">
          {/* 入居情報の修正 */}
          <form action={updateTenancyInfo.bind(null, tenancyId, roomId, bukkenId)} className="space-y-3">
            <p className="text-sm font-medium text-slate-700">入居情報</p>
            <div className="space-y-1">
              <Label htmlFor="tenant_name">入居者名 *</Label>
              <Input id="tenant_name" name="tenant_name" defaultValue={tenantName} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="move_in_date">入居日 *</Label>
                <Input id="move_in_date" name="move_in_date" type="date" defaultValue={moveInDate} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="move_out_date">退去日</Label>
                <Input id="move_out_date" name="move_out_date" type="date" defaultValue={moveOutDate ?? ''} />
                <p className="text-xs text-muted-foreground">空欄=入居中</p>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bikou">備考</Label>
              <Input id="bikou" name="bikou" defaultValue={bikou ?? ''} />
            </div>
            <div className="flex justify-end">
              <SubmitButton>入居情報を保存</SubmitButton>
            </div>
          </form>

          {/* 工程完了日の修正 */}
          {orderedSteps.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium text-slate-700">準備工程</p>
              {orderedSteps.map((step) => (
                <div key={step.prep_id} className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{processName(step.process_code)}</span>
                    {step.status_kbn === 2 ? <Badge variant="secondary">済</Badge> : <Badge>作業中</Badge>}
                  </div>
                  {step.status_kbn === 2 && (
                    <form action={updatePrepStepDate.bind(null, step.prep_id, roomId, bukkenId)}
                      className="mt-2 flex items-end gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`end_${step.prep_id}`}>完了日</Label>
                        <Input id={`end_${step.prep_id}`} name="end_date" type="date"
                          defaultValue={step.end_date ?? ''} required />
                      </div>
                      <SubmitButton>更新</SubmitButton>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}