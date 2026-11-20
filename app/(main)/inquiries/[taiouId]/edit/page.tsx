import { getTaiouRirekiDetail, getInquiryFormOptions } from '@/features/queries/inquiries'
import { updateTaiouRireki, deleteTaiouRireki } from '@/features/actions/lv801_inquiry_new'
import { InquiryForm } from '../../_InquiryForm'
import { DeleteButton } from './_DeleteButton'
import { BackLink } from '@/components/common/BackLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'
import { getChangeHistory } from '@/features/queries/history'
import { ChangeHistory } from '@/components/common/ChangeHistory'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default async function InquiryEditPage({
  params,
}: {
  params: Promise<{ taiouId: string }>
}) {
  const { taiouId } = await params
  const [t, options, history] = await Promise.all([
    getTaiouRirekiDetail(taiouId),
    getInquiryFormOptions(),
    getChangeHistory(taiouId, ['t500_taiou_rireki']),
  ])
  const accountNames = Object.fromEntries(options.accounts.map((a) => [String(a.account_id), a.name]))

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.INQUIRY_EDIT} />
      <div>
        <PageHeader title="対応履歴の編集" backHref="/inquiries" backLabel="一覧へ戻る"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={`/documents/inquiry/${taiouId}`}><FileText className="mr-1 h-4 w-4" />報告書を作成</Link>
            </Button>
          } />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">対応内容</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <InquiryForm
            action={updateTaiouRireki.bind(null, taiouId)}
            backHref="/inquiries"
            submitLabel="更新する"
            options={options}
            values={t}
          />
          {/* 削除ボタンを更新ボタン行の左端に重ねる */}
          <div className="-mt-[52px] w-fit">
            <DeleteButton action={deleteTaiouRireki.bind(null, taiouId)} />
          </div>
        </CardContent>
      </Card>

      <ChangeHistory rows={history} accountNames={accountNames} />
    </div>
  )
}