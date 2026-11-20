import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HistoryRow } from '@/features/queries/history'
import { COLUMN_LABEL, COLUMN_VALUE_LABEL, IGNORE_COLUMNS, TABLE_LABEL } from '@/constants/history'
import { formatCustomValue, type CustomField } from '@/lib/custom-fields'

type Change = { label: string; before: string; after: string }

function show(col: string, v: unknown, accountNames?: Record<string, string>): string {
  if (v === null || v === undefined || v === '') return '(空)'
  const kbn = COLUMN_VALUE_LABEL[col]
  if (kbn && typeof v === 'number') return kbn[v] ?? String(v)
  if ((col === 'uketsuke_account_id' || col === 'tantou_account_id') && accountNames) {
    return accountNames[String(v)] ?? String(v)
  }
  if (typeof v === 'number') return v.toLocaleString()
  return String(v)
}

function diff(
  row: HistoryRow,
  customFields: CustomField[],
  accountNames?: Record<string, string>,
): Change[] {
  const before = row.old_data ?? {}
  const after = row.new_data ?? {}
  const changes: Change[] = []

  const cols = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const col of cols) {
    if (IGNORE_COLUMNS.has(col)) continue

    // 追加項目は中身を1つずつ比べる
    if (col === 'custom_fields') {
      const b = (before.custom_fields ?? {}) as Record<string, unknown>
      const a = (after.custom_fields ?? {}) as Record<string, unknown>
      for (const id of new Set([...Object.keys(b), ...Object.keys(a)])) {
        if (JSON.stringify(b[id] ?? null) === JSON.stringify(a[id] ?? null)) continue
        const def = customFields.find((f) => f.field_id === id)
        const t = def ?? { field_type: 'text' as const }
        changes.push({
          label: def?.label ?? '(外した項目)',
          before: formatCustomValue(t, b[id]) ?? '(空)',
          after: formatCustomValue(t, a[id]) ?? '(空)',
        })
      }
      continue
    }

    if (JSON.stringify(before[col] ?? null) === JSON.stringify(after[col] ?? null)) continue
    changes.push({
      label: COLUMN_LABEL[col] ?? col,
      before: show(col, before[col], accountNames),
      after: show(col, after[col], accountNames),
    })
  }
  return changes
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// 変更履歴(誰が・いつ・何を・どう変えたか)。データは上書きせず全部残している。
export function ChangeHistory({
  rows,
  customFields = [],
  accountNames,
  title = '変更履歴',
}: {
  rows: HistoryRow[]
  customFields?: CustomField[]
  accountNames?: Record<string, string>
  title?: string
}) {
  // 中身が何も変わっていない更新(更新者名だけ等)は出さない
  rows = rows.filter((r) => {
    if (r.operation !== 'UPDATE') return true
    if (r.old_data?.mukou_kbn === 0 && r.new_data?.mukou_kbn === 1) return true
    return diff(r, customFields, accountNames).length > 0
  })

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          {title}
          <span className="text-sm font-normal text-muted-foreground">{rows.length}件</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ変更はありません</p>
        ) : (
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">開いて見る</summary>
            <ol className="mt-3 space-y-3">
              {rows.map((r) => {
                const isDelete =
                  r.operation === 'DELETE' ||
                  (r.operation === 'UPDATE' && r.old_data?.mukou_kbn === 0 && r.new_data?.mukou_kbn === 1)
                const changes = r.operation === 'UPDATE' && !isDelete ? diff(r, customFields, accountNames) : []
                const what = TABLE_LABEL[r.table_name] ?? ''
                return (
                  <li key={r.history_id} className="rounded-md border bg-white p-3 text-sm">
                    <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{fmtDate(r.changed_at)}</span>
                      <span>{r.changed_by ?? '不明'}</span>
                      <span>
                        {r.operation === 'INSERT' ? `${what}を登録`
                          : isDelete ? `${what}を削除`
                          : `${what}を変更`}
                      </span>
                    </div>
                    {changes.length > 0 && (
                      <ul className="space-y-0.5">
                        {changes.map((c, i) => (
                          <li key={i}>
                            <span className="font-medium">{c.label}</span>:{' '}
                            <span className="text-muted-foreground line-through">{c.before}</span>
                            {' → '}
                            <span>{c.after}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ol>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
