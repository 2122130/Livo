'use client'

import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/common/Modal'
import { SubmitButton } from '@/components/common/SubmitButton'
import { finishPrepStep } from '@/features/actions/lv110_room_detail'
import { toWareki } from '@/lib/date'

type Step = { prep_id: string; process_code: number; status_kbn: number; end_date: string | null }
type Process = { process_code: number; process_name: string; sort_order: number }

export function PrepModal({
  steps,
  prepSetId,
  roomId,
  bukkenId,
  processes,        
}: {
  steps: Step[]
  prepSetId: string
  roomId: string
  bukkenId: string
  processes: Process[]
}) {
  const [open, setOpen] = useState(false)

  // 工程コード→工程名(Client側で変換関数を作る)
  const processName = (code: number) =>
    processes.find((p) => p.process_code === code)?.process_name ?? `工程${code}`

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Wrench className="mr-1 h-4 w-4" />
        準備工程を進める
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="準備工程" maxWidth="max-w-lg">
        <div className="space-y-2">
          <p className="text-sm font-medium">上から順に完了してください</p>
          {steps.map((step, index) => {
            const done = step.status_kbn === 2
            const prevAllDone = steps.slice(0, index).every((s) => s.status_kbn === 2)
            const canFinish = !done && prevAllDone

            return (
              <div key={step.prep_id} className="rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{processName(step.process_code)}</span>
                  {done ? (
                    <Badge variant="secondary">完了 {step.end_date ? toWareki(step.end_date) : ''}</Badge>
                  ) : prevAllDone ? (
                    <Badge>作業中</Badge>
                  ) : (
                    <Badge variant="outline">待機中</Badge>
                  )}
                </div>
                {canFinish && (
                  <form action={finishPrepStep.bind(null, step.prep_id, prepSetId, roomId, bukkenId)}
                    className="mt-2 flex items-end gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`end_${step.prep_id}`}>完了日</Label>
                      <Input id={`end_${step.prep_id}`} name="end_date" type="date" required />
                    </div>
                    <SubmitButton>この工程を完了</SubmitButton>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}