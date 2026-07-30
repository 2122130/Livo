import { BackLink } from '@/components/common/BackLink'

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  action,
}: {
  title: string
  subtitle?: string
  backHref?: string       // 戻るリンクの行き先(あれば表示)
  backLabel?: string      // 戻るリンクの文言
  action?: React.ReactNode // 右側に置くボタンなど(任意)
}) {
  return (
    <div className="mb-3 sm:mb-4 space-y-2">
      {/* 戻るリンク(指定があれば) */}
      {backHref && backLabel && (
        <BackLink href={backHref} label={backLabel} />
      )}

      {/* 見出しバー */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-3.5">
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="border-l-4 border-emerald-600 pl-3 text-lg font-extrabold tracking-wide text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden text-xs font-medium text-slate-500 sm:block">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}