import { getRoomDetail, getRentalBukken } from '@/features/queries/rental'
import { getCustomFields } from '@/features/queries/custom-fields'
import { getMyOrgName } from '@/features/queries/org'
import { BUKKEN_CATEGORY_LABEL, ROOM_STATUS_LABEL } from '@/constants/kbn'
import { formatCustomValue, type CustomField, type CustomValues } from '@/lib/custom-fields'
import { DocumentSheet, DocSection, DocTable } from '@/components/common/DocumentSheet'

const yen = (v: number | null | undefined) => (v == null ? null : `${v.toLocaleString()}円`)

function customRows(fields: CustomField[], values?: CustomValues | null): [string, string | null][] {
  return fields.map((f) => [f.label, formatCustomValue(f, values?.[f.field_id])])
}

// 部屋の募集資料(物件概要書)
export default async function RoomDocumentPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const room = await getRoomDetail(roomId)
  const [bukken, roomFields, rentalFields, orgName] = await Promise.all([
    getRentalBukken(room.bukken_id),
    getCustomFields('room'),
    getCustomFields('rental'),
    getMyOrgName(),
  ])

  const total = (room.rent ?? 0) + (room.other_fee ?? 0)

  return (
    <DocumentSheet
      title="物件概要書(賃貸)"
      orgName={orgName}
      backHref={`/bukken/rental/${room.bukken_id}/rooms/${roomId}`}
      backLabel="部屋詳細へ戻る"
    >
      <div>
        <p className="text-xl font-bold">{bukken.bukken_name} {room.room_number}</p>
        {bukken.address && <p className="text-slate-600">{bukken.address}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded border border-slate-400 p-3">
          <div className="text-xs text-slate-500">賃料</div>
          <div className="text-xl font-bold">{yen(room.rent) ?? '—'}</div>
        </div>
        <div className="rounded border border-slate-400 p-3">
          <div className="text-xs text-slate-500">その他費用</div>
          <div className="text-xl font-bold">{yen(room.other_fee) ?? '—'}</div>
        </div>
        <div className="rounded border border-slate-400 p-3">
          <div className="text-xs text-slate-500">月額合計</div>
          <div className="text-xl font-bold">{total > 0 ? `${total.toLocaleString()}円` : '—'}</div>
        </div>
      </div>


      <DocSection title="部屋の情報">
        <DocTable rows={[
          ['部屋番号', room.room_number],
          ['間取り', room.layout],
          ['賃料', yen(room.rent)],
          ['その他費用', yen(room.other_fee)],
          ['駐車場', room.parking_number],
          ['保証会社', room.guarantee_company],
          ['現在の状態', ROOM_STATUS_LABEL[room.room_status]],
          ...customRows(roomFields, room.custom_fields as CustomValues),
        ]} />
      </DocSection>

      <DocSection title="建物の情報">
        <DocTable rows={[
          ['物件名', bukken.bukken_name],
          ['種別', BUKKEN_CATEGORY_LABEL[bukken.bukken_category]],
          ['所在地', bukken.address],
          ...customRows(rentalFields, bukken.custom_fields as CustomValues),
        ]} />
      </DocSection>

      <p className="pt-4 text-xs text-slate-500">
        ※ 記載内容は作成日時点のものです。現況と異なる場合は現況を優先します。
      </p>
    </DocumentSheet>
  )
}
