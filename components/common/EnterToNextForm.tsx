'use client'

import { useRef } from 'react'

// フォームをこれで包むと、入力欄でEnterを押したとき送信せず次のフィールドへ移動する。
// 最後の入力欄では送信ボタンへフォーカスする(そこでEnterを押すと送信)。
export function EnterToNextForm({
  action,
  children,
  className,
  id,
}: {
  action: (formData: FormData) => void
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const formRef = useRef<HTMLFormElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== 'Enter') return

    const target = e.target as HTMLElement
    // テキストエリアの改行はそのまま許可
    if (target.tagName === 'TEXTAREA') return
    // 送信ボタン上でのEnterは通常どおり送信させる
    if (target.tagName === 'BUTTON') return

    // それ以外(input/select)のEnterは送信を止めて次へ移動
    e.preventDefault()

    if (!formRef.current) return
    // フォーム内のフォーカス可能な要素を順に集める
    const focusables = Array.from(
      formRef.current.querySelectorAll<HTMLElement>(
        'input, select, textarea, button[type="submit"]'
      )
    ).filter((el) => !(el as HTMLInputElement).disabled)

    const index = focusables.indexOf(target)
    const next = focusables[index + 1]
    if (next) next.focus()
  }

  return (
    <form ref={formRef} action={action} className={className} id={id} onKeyDown={handleKeyDown}>
      {children}
    </form>
  )
}