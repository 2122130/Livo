import Link from 'next/link'
import { getInquiryFormOptions } from '@/features/queries/inquiries'
import { getMyAccount } from '@/features/auth/get-my-account'
import { createTaiouRireki } from '@/features/actions/lv801_inquiry_new'
import { InquiryForm } from '../_InquiryForm'
import { BackLink } from '@/components/common/BackLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessLogger } from '@/components/common/AccessLogger'
import { SCREEN } from '@/constants/screens'
import { PageHeader } from '@/components/common/PageHeader'

export default async function InquiryNewPage({
  searchParams,
}: {
  searchParams: Promise<{ kbn?: string }>
}) {
  const { kbn } = await searchParams
  const [options, account] = await Promise.all([
    getInquiryFormOptions(),
    getMyAccount(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccessLogger screenId={SCREEN.INQUIRY_NEW} />
      <div>
        <PageHeader title="対応履歴の登録" backHref={`/inquiries?tab=${kbn === '2' ? 'sale' : 'rental'}`} backLabel="一覧へ戻る" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">対応内容</CardTitle></CardHeader>
        <CardContent>
          <InquiryForm
            action={createTaiouRireki}
            backHref={`/inquiries?tab=${kbn === '2' ? 'sale' : 'rental'}`}
            submitLabel="登録する"
            options={options}
            defaultAccountId={account?.account_id}
            values={{ bukken_kbn: kbn === '2' ? 2 : 1 }}
          />
        </CardContent>
      </Card>
    </div>
  )
}