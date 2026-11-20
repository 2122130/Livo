import { getTaiouRirekiDetail } from '@/features/queries/inquiries'
import { getMyOrgName } from '@/features/queries/org'
import { TAIOU_KBN_LABEL, TAIOU_STATUS_LABEL, BUKKEN_KBN_LABEL } from '@/constants/kbn'
import { DocumentSheet, DocSection, DocTable } from '@/components/common/DocumentSheet'

// 対応報告書(オーナーさんへの報告などに使う)
export default async function InquiryDocumentPage({
  params,
}: {
  params: Promise<{ taiouId: string }>
}) {
  const { taiouId } = await params
  const [t, orgName] = await Promise.all([
    getTaiouRirekiDetail(taiouId),
    getMyOrgName(),
  ])

  const target = [
    t.bukken_name,
    t.room_number ? `${t.room_number}号室` : null,
  ].filter(Boolean).join(' ')

  return (
    <DocumentSheet
      title="対応報告書"
      orgName={orgName}
      backHref={`/inquiries/${taiouId}/edit`}
      backLabel="対応履歴へ戻る"
    >
      <DocSection title="概要">
        <DocTable rows={[
          ['件名', t.title],
          ['受付日', t.uketsuke_date],
          ['区分', TAIOU_KBN_LABEL[t.taiou_kbn]],
          ['進捗', TAIOU_STATUS_LABEL[t.status_kbn]],
          ['対象物件', `${BUKKEN_KBN_LABEL[t.bukken_kbn] ?? ''} ${target}`.trim()],
          ['お客様', t.customer_name],
          ['連絡先', t.customer_tel],
          ['受付者', t.uketsuke_name],
          ['担当者', t.tantou_name],
        ]} />
      </DocSection>

      <DocSection title="対応内容">
        <div className="min-h-32 whitespace-pre-wrap rounded border border-slate-400 p-3">{t.content}</div>
      </DocSection>

      {t.bikou && (
        <DocSection title="備考">
          <div className="whitespace-pre-wrap rounded border border-slate-400 p-3">{t.bikou}</div>
        </DocSection>
      )}

      <div className="grid grid-cols-2 gap-6 pt-8">
        <div className="border-t border-slate-500 pt-1 text-xs text-slate-500">確認者</div>
        <div className="border-t border-slate-500 pt-1 text-xs text-slate-500">確認日</div>
      </div>
    </DocumentSheet>
  )
}
