'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 画像を縮小してJPEGにする(送信サイズを抑えるため)
async function shrinkImage(file: File, maxSide = 2000): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', 0.85),
  )
}

type FieldSpec = {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: Record<string, string>
}

// フォーム内の入力欄を自動で拾って、読み取り対象の項目一覧にする
function collectFields(form: HTMLFormElement): FieldSpec[] {
  const out: FieldSpec[] = []
  const els = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input[name], select[name], textarea[name]',
  )
  for (const el of els) {
    if (el.disabled) continue
    if (el instanceof HTMLInputElement && ['hidden', 'file', 'submit', 'button', 'checkbox', 'radio'].includes(el.type)) continue
    const labelEl = el.id ? form.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null
    const label = (labelEl?.textContent ?? el.name).replace('*', '').trim()

    if (el instanceof HTMLSelectElement) {
      const options: Record<string, string> = {}
      for (const o of el.options) if (o.value !== '') options[o.value] = o.text
      out.push({ name: el.name, label, type: 'select', options })
    } else if (el instanceof HTMLTextAreaElement) {
      out.push({ name: el.name, label, type: 'textarea' })
    } else {
      const t = el.type === 'number' ? 'number' : el.type === 'date' ? 'date' : 'text'
      out.push({ name: el.name, label, type: t })
    }
  }
  return out
}

// 「書類を撮って自動入力」ボタン。フォームの中に置くだけで使える。
export function OcrButton() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const form = wrapRef.current?.closest('form')
    if (!form) return

    setBusy(true)
    setMsg(null)
    try {
      const fields = collectFields(form)
      const body = new FormData()
      const blob = await shrinkImage(file)
      body.append('file', blob, file.name)
      body.append('fields', JSON.stringify(fields))

      const res = await fetch('/api/ocr', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '読み取りに失敗しました')

      const values = (json.values ?? {}) as Record<string, string>
      let filled = 0
      for (const [name, value] of Object.entries(values)) {
        const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          `[name="${CSS.escape(name)}"]`,
        )
        if (!el || el.disabled) continue
        if (el instanceof HTMLSelectElement) {
          const opt = Array.from(el.options).find((o) => o.value === value || o.text === value)
          if (!opt) continue
          el.value = opt.value
          el.dispatchEvent(new Event('change', { bubbles: true }))
        } else {
          el.value = value
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
        el.classList.add('bg-amber-50')
        filled++
      }
      setMsg(
        filled > 0
          ? { ok: true, text: `${filled}項目を入力しました(黄色の欄)。内容を確認してから保存してください。` }
          : { ok: false, text: '読み取れる項目がありませんでした。' },
      )
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : '読み取りに失敗しました' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={wrapRef} className="space-y-2 print:hidden">
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPick} />
      <Button type="button" variant="outline" className="w-full" disabled={busy}
        onClick={() => fileRef.current?.click()}>
        {busy ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />読み取り中...(10〜20秒)</>
        ) : (
          <><Camera className="mr-2 h-4 w-4" />書類を撮影・選択して自動入力</>
        )}
      </Button>
      {msg && (
        <p className={`text-xs ${msg.ok ? 'text-green-700' : 'text-destructive'}`}>{msg.text}</p>
      )}
    </div>
  )
}
