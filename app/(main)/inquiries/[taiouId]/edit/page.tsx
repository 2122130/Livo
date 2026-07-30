import { getTaiouRirekiDetail, getInquiryFormOptions } from '@/features/queries/inquiries'
import { updateTaiouRireki, deleteTaiouRireki } from '@/features/actions/lv801_inquiry_new'
import { InquiryForm } from '../../_InquiryForm'
import { DeleteButton } from './_DeleteButton'
import { BackLink } from '@/components/common/BackLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'

export default async function InquiryEditPage({
  params,
}: {
  params: Promise<{ taiouId: string }>
}) {
  const { taiouId } = await params
  const [t, options] = await Promise.all([
    getTaiouRirekiDetail(taiouId),
    getInquiryFormOptions(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.INQUIRY_EDIT} />
      <div>
        <BackLink href="/inquiries" label="対応履歴一覧へ" />
        <h1 className="text-xl font-semibold">対応履歴の編集</h1>
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
    </div>
  )
}