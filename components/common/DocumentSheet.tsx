import { PrintButton } from '@/components/common/PrintButton'
import { BackLink } from '@/components/common/BackLink'

// 書類(A4)の共通の枠。画面ではプレビュー、印刷ではA4用紙1枚分になる。
export function DocumentSheet({
  title,
  orgName,
  backHref,
  backLabel,
  children,
}: {
  title: string
  orgName?: string | null
  backHref: string
  backLabel: string
  children: React.ReactNode
}) {
  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4; margin: 14mm; } body { background: #fff !important; } }`}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <BackLink href={backHref} label={backLabel} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">印刷画面で「PDFに保存」を選ぶとPDFになります</span>
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto w-full max-w-[210mm] bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <header className="mb-6 flex items-end justify-between border-b-2 border-slate-800 pb-3">
          <h1 className="text-2xl font-bold tracking-widest">{title}</h1>
          <div className="text-right text-xs text-slate-600">
            <div>作成日: {today}</div>
            {orgName && <div className="mt-0.5 text-sm font-medium text-slate-800">{orgName}</div>}
          </div>
        </header>
        <div className="space-y-6 text-sm">{children}</div>
      </article>
    </div>
  )
}

// 書類内の表(項目名 | 値)
export function DocTable({ rows }: { rows: [string, React.ReactNode][] }) {
  const visible = rows.filter(([, v]) => v !== null && v !== undefined && v !== '')
  if (visible.length === 0) return null
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {visible.map(([label, value], i) => (
          <tr key={i} className="break-inside-avoid">
            <th className="w-1/3 border border-slate-400 bg-slate-100 px-3 py-2 text-left font-medium">{label}</th>
            <td className="whitespace-pre-wrap border border-slate-400 px-3 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid space-y-2">
      <h2 className="border-l-4 border-slate-700 pl-2 text-base font-bold">{title}</h2>
      {children}
    </section>
  )
}
