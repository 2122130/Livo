import { MAIN_MENU } from '@/constants/menu'
import { getTaiouCounts } from '@/features/queries/inquiries'
import { SCREEN } from '@/constants/screens'
import { AccessLogger } from '@/components/common/AccessLogger'
import Link from 'next/link'
import { LoadingLink } from '@/components/common/LoadingLink'

export default async function MainMenuPage() {
  const counts = await getTaiouCounts()
  const hasUrgent = counts.notYet > 0

  return (
    <main className="p-3 sm:p-6 max-w-6xl mx-auto">
      <AccessLogger screenId={SCREEN.MAIN_MENU} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 sm:px-5 sm:py-3.5 mb-3 sm:mb-4 flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-extrabold text-slate-900 border-l-4 border-emerald-600 pl-3 tracking-wide">
          メインメニュー
        </h3>
        <p className="text-xs text-slate-500 font-medium hidden sm:block">行う業務を選択</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {MAIN_MENU.map((item) => {
          const Icon = item.icon
          const isInquiry = item.screenId === SCREEN.INQUIRY_LIST
          const urgentClass = isInquiry && hasUrgent ? 'panel-urgent' : ''

          return (
            <LoadingLink key={item.screenId} href={item.href} className={`menu-panel ${item.panelClass} ${urgentClass}`}>
              <div className="min-w-0">
                <span className="panel-title">{item.label}</span>
                <span className="panel-desc">{item.description}</span>
                {isInquiry && (counts.notYet > 0 || counts.inProgress > 0) && (
                  <div className="mt-2 flex gap-1">
                    {counts.notYet > 0 && (
                      <span className="inline-flex items-center bg-rose-50 text-rose-600 border border-rose-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                        未対応 {counts.notYet}
                      </span>
                    )}
                    {counts.inProgress > 0 && (
                      <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        対応中 {counts.inProgress}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="panel-icon-wrapper">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </LoadingLink>
          )
        })}
      </div>
    </main>
  )
}