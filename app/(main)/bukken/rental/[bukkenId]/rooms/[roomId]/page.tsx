import Link from 'next/link'
import {
  getRoomDetail,
  getTenancyHistory,
  getActivePrepSet,
  getPrepProcesses,
  getTenancyWithPrep,
  getPrepSetHistory,
} from '@/features/queries/rental'
import { moveIn, moveOut, finishPrepStep } from '@/features/actions/lv110_room_detail'
import { ROOM_STATUS_LABEL } from '@/constants/kbn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EnterToNextForm } from '@/components/common/EnterToNextForm'
import { updateTenancyBikou } from '@/features/actions/lv110_room_detail'
import { TenancyTable } from './_TenancyTable'
import { BackLink } from '@/components/common/BackLink'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'
import { SubmitButton } from '@/components/common/SubmitButton'

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bukkenId: string; roomId: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { bukkenId, roomId } = await params
  const { from } = await searchParams

  // 戻り先を決める
  const backLink = from === 'vacancy'
    ? { href: '/vacancy', label: '空室管理へ' }
    : { href: `/bukken/rental/${bukkenId}/rooms`, label: '部屋一覧へ' }

  const [room, tenancyRows, activeSet, processes] = await Promise.all([
    getRoomDetail(roomId),
    getTenancyWithPrep(roomId),      // 入居履歴+工程
    getActivePrepSet(roomId),        // 操作エリア用(準備中の工程完了ボタン)は従来通り
    getPrepProcesses(),
  ])

  const status = room.room_status
  const activeTenancy = tenancyRows.find((t) => t.move_out_date === null)

  // 工程コード→工程名の変換用
  const processName = (code: number) =>
    processes.find((p) => p.process_code === code)?.process_name ?? `工程${code}`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AccessLogger screenId={SCREEN.ROOM_DETAIL} />
      {/* ヘッダー */}
      <div>
        <PageHeader title={`${room.bukken_name} - ${room.room_number}`} backHref={`/bukken/rental/${bukkenId}/rooms`} backLabel="部屋一覧へ" />
        {/* <Button asChild variant="link" className="h-auto p-0 text-muted-foreground">
          <BackLink href={backLink.href} label={backLink.label} />
        </Button> */}
        <div className="flex items-center gap-3">
          {/* <h1 className="text-xl font-semibold">
            {room.bukken_name ?? ''} - {room.room_number}
          </h1> */}
          <Badge variant={status === 2 ? 'default' : status === 3 ? 'outline' : 'secondary'}>
            {ROOM_STATUS_LABEL[status]}
          </Badge>
        </div>
      </div>

      {/* 操作エリア */}
      <Card>
        <CardHeader><CardTitle className="text-base">操作</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* 空室: 入居させる */}
          {status === 1 && (
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer font-medium">入居させる</summary>
              <EnterToNextForm action={moveIn.bind(null, roomId, bukkenId)} className="mt-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="tenant_name">入居者名 *</Label>
                  <Input id="tenant_name" name="tenant_name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="move_in_date">入居日 *</Label>
                  <Input id="move_in_date" name="move_in_date" type="date" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bikou">備考</Label>
                  <Input id="bikou" name="bikou" />
                </div>
                <SubmitButton>入居を記録</SubmitButton>
              </EnterToNextForm>
            </details>
          )}

          {/* 入居中: 退去(→準備セット自動生成) */}
          {status === 2 && activeTenancy && (
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer font-medium">
                退去させる(現在の入居者: {activeTenancy.tenant_name})
              </summary>
              <form
                action={moveOut.bind(null, activeTenancy.tenancy_id, roomId, bukkenId)}
                className="mt-3 space-y-3"
              >
                <div className="space-y-1">
                  <Label htmlFor="move_out_date">退去日 *</Label>
                  <Input id="move_out_date" name="move_out_date" type="date" required />
                </div>
                <p className="text-xs text-muted-foreground">
                  退去すると準備工程({processes.map((p) => p.process_name).join('→')})が自動で作成されます。全工程を完了すると空室に戻ります。
                </p>
                <SubmitButton>退去して準備開始</SubmitButton>
              </form>
            </details>
          )}

          {/* 準備中: 工程を順に完了 */}
          {status === 3 && activeSet && (
            <div className="space-y-2">
              <p className="text-sm font-medium">準備工程(上から順に完了してください)</p>
              {activeSet.steps.map((step, index) => {
                const done = step.status_kbn === 2
                // 自分より前の工程がすべて完了しているか
                const prevAllDone = activeSet.steps
                  .slice(0, index)
                  .every((s) => s.status_kbn === 2)
                const canFinish = !done && prevAllDone

                return (
                  <div key={step.prep_id} className="rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{processName(step.process_code)}</span>
                      {done ? (
                        <Badge variant="secondary">完了 {step.end_date}</Badge>
                      ) : prevAllDone ? (
                        <Badge>作業中</Badge>
                      ) : (
                        <Badge variant="outline">待機中</Badge>
                      )}
                    </div>

                    {canFinish && (
                      <form
                        action={finishPrepStep.bind(
                          null, step.prep_id, activeSet.prep_set_id, roomId, bukkenId
                        )}
                        className="mt-2 flex items-end gap-2"
                      >
                        <div className="space-y-1">
                          <Label htmlFor={`end_${step.prep_id}`}>完了日</Label>
                          <Input
                            id={`end_${step.prep_id}`}
                            name="end_date"
                            type="date"
                            required
                          />
                        </div>
                        <SubmitButton>この工程を完了</SubmitButton>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 入居・準備履歴(統合) */}
      <Card>
        <CardHeader><CardTitle className="text-base">入居・準備履歴</CardTitle></CardHeader>
        <CardContent>
          <TenancyTable
            rows={tenancyRows}
            processes={processes}
            updateBikou={updateTenancyBikou.bind(null, roomId, bukkenId)}
          />
        </CardContent>
      </Card>
    </div>
  )
}