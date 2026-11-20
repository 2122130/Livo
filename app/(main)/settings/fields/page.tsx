import { redirect } from 'next/navigation'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { getMyAccount } from '@/features/auth/get-my-account'
import { getAllCustomFields } from '@/features/queries/custom-fields'
import { removeCustomField, moveCustomField } from '@/features/actions/lv930_custom_fields'
import { ROLE } from '@/constants/kbn'
import { CUSTOM_TARGET_LABEL, CUSTOM_TYPE_LABEL, type CustomFieldTarget } from '@/lib/custom-fields'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/common/PageHeader'
import { AddFieldForm } from './_AddFieldForm'

export default async function CustomFieldsPage() {
  const me = await getMyAccount()
  if (!me) redirect('/login')
  if (me.role !== ROLE.ADMIN && me.role !== ROLE.SYSTEM) redirect('/settings')

  const fields = await getAllCustomFields()
  const targets: CustomFieldTarget[] = ['rental', 'room', 'sale']

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="項目の追加"
        subtitle="物件・部屋に、自社で使う項目を自由に足せます"
        backHref="/settings"
        backLabel="設定へ"
      />

      <Card>
        <CardHeader><CardTitle className="text-base">新しい項目を足す</CardTitle></CardHeader>
        <CardContent>
          <AddFieldForm />
        </CardContent>
      </Card>

      {targets.map((t) => {
        const list = fields.filter((f) => f.target === t)
        return (
          <Card key={t}>
            <CardHeader>
              <CardTitle className="text-base">
                {CUSTOM_TARGET_LABEL[t]}の追加項目
                <span className="ml-2 text-sm font-normal text-muted-foreground">{list.length}件</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground">まだありません</p>
              )}
              {list.map((f, i) => (
                <div key={f.field_id} className="flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{f.label}</span>
                    <Badge variant="outline">{CUSTOM_TYPE_LABEL[f.field_type]}</Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <form action={moveCustomField.bind(null, f.field_id, 'up')}>
                      <Button type="submit" variant="ghost" size="icon" disabled={i === 0} title="上へ">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={moveCustomField.bind(null, f.field_id, 'down')}>
                      <Button type="submit" variant="ghost" size="icon" disabled={i === list.length - 1} title="下へ">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={removeCustomField.bind(null, f.field_id)}>
                      <Button type="submit" variant="ghost" size="icon" title="この項目を外す"
                        className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <p className="text-xs text-muted-foreground">
        項目を外しても、それまでに入力した値は消えずに変更履歴に残ります。
      </p>
    </div>
  )
}
