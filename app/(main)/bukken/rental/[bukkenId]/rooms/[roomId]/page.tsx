import {
  getRoomDetail,
  getActivePrepSet,
  getPrepProcesses,
  getTenancyWithPrep,
} from '@/features/queries/rental'
import { moveIn, moveOut} from '@/features/actions/lv110_room_detail'
import { ROOM_STATUS_LABEL } from '@/constants/kbn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TenancyTable } from './_TenancyTable'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'
import { getTenancyFiles } from '@/features/queries/tenancy-file'
import { FileModal } from './_FileModal'
import { getTenancyFilesMap } from '@/features/queries/tenancy-file'
import { MoveInModal } from './_MoveInModal'
import { MoveOutModal } from './_MoveOutModal'
import { PrepModal } from './_PrepModal'

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

  const activeFiles = activeTenancy
    ? await getTenancyFiles(activeTenancy.tenancy_id)
    : []

  // 工程コード→工程名の変換用
  const processName = (code: number) =>
    processes.find((p) => p.process_code === code)?.process_name ?? `工程${code}`

  // 入居履歴の全入居分のファイルをまとめて取得(展開表示用)
  const tenancyIds = tenancyRows.map((t) => t.tenancy_id)
  const filesMap = await getTenancyFilesMap(tenancyIds)

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

      {/* 操作エリア(情報カード) */}
      <Card>
        <CardHeader><CardTitle className="text-base">状況</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* 状況バッジ */}
          <div className="flex items-center gap-3">
            <Badge variant={status === 2 ? 'default' : status === 3 ? 'outline' : 'secondary'}>
              {ROOM_STATUS_LABEL[status]}
            </Badge>
            {activeTenancy && (
              <span className="text-sm text-muted-foreground">入居者: {activeTenancy.tenant_name}</span>
            )}
          </div>

          {/* 状況に応じたアクション + 資料(横並び) */}
          <div className="flex flex-wrap gap-2">
            {status === 1 && (
              <MoveInModal action={moveIn.bind(null, roomId, bukkenId)} />
            )}
            {status === 2 && activeTenancy && (
              <MoveOutModal
                action={moveOut.bind(null, activeTenancy.tenancy_id, roomId, bukkenId)}
                tenantName={activeTenancy.tenant_name}
                prepProcessNames={processes.map((p) => p.process_name).join('→')}
              />
            )}
            {status === 3 && activeSet && (
              <PrepModal
                steps={activeSet.steps}
                prepSetId={activeSet.prep_set_id}
                roomId={roomId}
                bukkenId={bukkenId}
                processes={processes}
              />
            )}
            {/* 資料(入居中・準備中) */}
            {activeTenancy && (
              <FileModal
                tenancyId={activeTenancy.tenancy_id}
                roomId={roomId}
                bukkenId={bukkenId}
                tenantName={activeTenancy.tenant_name}
                files={activeFiles}
                triggerLabel="この入居者の資料"
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      

      {/* 入居・準備履歴(統合) */}
      <Card>
        <CardHeader><CardTitle className="text-base">入居・準備履歴</CardTitle></CardHeader>
        <CardContent>
          <TenancyTable
            rows={tenancyRows}
            processes={processes}
            filesMap={filesMap}
            roomId={roomId}
            bukkenId={bukkenId}
          />
        </CardContent>
      </Card>
    </div>
  )
}