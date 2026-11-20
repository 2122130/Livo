// 契約書(頭書)用の部品。印刷前に画面上で直接書き足せるようにしている。

// 書き込める欄。値が無いときは薄い黄色(印刷では消える)
export function E({
  v,
  className = '',
  minW = '4em',
}: {
  v?: React.ReactNode
  className?: string
  minW?: string
}) {
  const empty = v === null || v === undefined || v === ''
  return (
    <span
      data-e=""
      contentEditable
      suppressContentEditableWarning
      style={{ minWidth: minW }}
      className={`inline-block min-h-[1.4em] rounded-sm px-0.5 align-middle outline-none focus:bg-sky-50 print:bg-transparent ${
        empty ? 'bg-amber-50' : ''
      } ${className}`}
    >
      {empty ? '' : v}
    </span>
  )
}

export function T({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <table className={`w-full border-collapse text-[12px] leading-snug ${className}`}><tbody>{children}</tbody></table>
}

// 見出しのセル
export function H({
  children, rowSpan, colSpan, className = '',
}: {
  children?: React.ReactNode; rowSpan?: number; colSpan?: number; className?: string
}) {
  return (
    <th rowSpan={rowSpan} colSpan={colSpan}
      className={`border border-slate-700 bg-slate-50 px-1.5 py-1 text-center font-medium print:bg-transparent ${className}`}>
      {children}
    </th>
  )
}

// 値のセル(中身は書き込める)
export function D({
  v, rowSpan, colSpan, className = '', children,
}: {
  v?: React.ReactNode; rowSpan?: number; colSpan?: number; className?: string; children?: React.ReactNode
}) {
  return (
    <td rowSpan={rowSpan} colSpan={colSpan} className={`border border-slate-700 px-1.5 py-1 ${className}`}>
      {children ?? <E v={v} className="w-full" />}
    </td>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-1 mt-4 text-[13px] font-bold">{children}</h2>
}
