'use client'

import { useState } from 'react'

// 押すと ☐ ⇔ ☑ が切り替わるチェック欄
export function CheckMark({ checked = false, label }: { checked?: boolean; label?: string }) {
  const [on, setOn] = useState(checked)
  return (
    <button type="button" data-check="" data-checked={on ? 'true' : 'false'} onClick={() => setOn(!on)}
      className="inline-flex items-center gap-0.5 whitespace-nowrap text-left">
      <span className="text-[14px] leading-none">{on ? '☑' : '☐'}</span>
      {label && <span>{label}</span>}
    </button>
  )
}
