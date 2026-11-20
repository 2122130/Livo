import Link from 'next/link'
import { getContractData, getContractDraft, CONTRACT_LAYOUT_VERSION } from '@/features/queries/contract'
import { ContractEditor } from '@/components/contract/ContractEditor'
import { BUKKEN_CATEGORY } from '@/constants/kbn'
import { BackLink } from '@/components/common/BackLink'
import { PrintButton } from '@/components/common/PrintButton'
import { HouseSheet, StoreSheet } from '@/components/contract/Sheets'

// 契約書の頭書(住居用・店舗用)。毎回書く欄だけを作り、契約条項などは今までの用紙を使う。
export default async function ContractPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ type?: string; tenancy?: string }>
}) {
  const { roomId } = await params
  const { type, tenancy } = await searchParams
  const data = await getContractData(roomId, tenancy)

  const isStore = type ? type === 'store' : data.bukken.bukken_category === BUKKEN_CATEGORY.STORE
  const base = `/documents/contract/${roomId}${tenancy ? `?tenancy=${tenancy}&` : '?'}`
  const sheetType = isStore ? 'store' : 'house'
  const tenancyKey = data.tenancy?.tenancy_id ? String(data.tenancy.tenancy_id) : ''
  const draft = await getContractDraft(roomId, tenancyKey, sheetType)

  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4; margin: 12mm 14mm; } body { background:#fff !important; } }`}</style>

      {/* 操作(印刷されない) */}
      <div className="space-y-2 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackLink href={`/bukken/rental/${data.room.bukken_id}/rooms/${roomId}`} label="部屋詳細へ戻る" />
          <PrintButton />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">用紙:</span>
          <Link href={`${base}type=house`}
            className={`rounded-md border px-3 py-1 ${!isStore ? 'border-emerald-600 bg-emerald-50 font-medium' : 'bg-white'}`}>
            住居用
          </Link>
          <Link href={`${base}type=store`}
            className={`rounded-md border px-3 py-1 ${isStore ? 'border-emerald-600 bg-emerald-50 font-medium' : 'bg-white'}`}>
            事業用(店舗)
          </Link>
        </div>
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          Livoに入っている情報を自動で入れています。<b>黄色の欄や空欄はクリックすると直接書けます</b>(☐も押すと☑になります)。
          書いた内容は自動で保存され、次に開いたときもそのまま残ります(住居用と店舗用は別々に保存)。
          {draft && <> 保存した内容を表示しているため、あとでLivoの情報を変えてもこの書類には反映されません。反映したいときは「Livoの情報に戻す」を押してください。</>}
          契約条項・重要事項説明書など毎回同じページは、今までの用紙を使ってください。
          {!data.tenancy && <><br /><b>この部屋には入居の記録がないため、借主の欄は空欄です。</b></>}
        </div>
      </div>

      <ContractEditor
        key={sheetType}
        draftKey={{ roomId, tenancyKey, sheetType }}
        layoutVersion={CONTRACT_LAYOUT_VERSION[sheetType]}
        draft={draft}
      >
        <article className="mx-auto w-full max-w-[210mm] bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
          {isStore ? <StoreSheet d={data} /> : <HouseSheet d={data} />}
        </article>
      </ContractEditor>
    </div>
  )
}

