'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  saveContractDraft, resetContractDraft, type DraftKey, type DraftValues,
} from '@/features/actions/lv940_contract_draft'

type Status = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

// 契約書の書き込み欄を集めて保存・復元する
export function ContractEditor({
  draftKey,
  layoutVersion,
  draft,
  children,
}: {
  draftKey: DraftKey
  layoutVersion: string
  draft: { values: DraftValues; layout_version: string; update_date: string; update_account: string | null } | null
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [savedAt, setSavedAt] = useState<string | null>(draft?.update_date ?? null)
  const [savedBy, setSavedBy] = useState<string | null>(draft?.update_account ?? null)
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<Status>('idle')
  useEffect(() => { statusRef.current = status }, [status])

  const fields = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-e]') ?? [])
  const checks = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-check]') ?? [])

  const markEmpty = (el: HTMLElement) => {
    const empty = (el.innerText ?? '').trim() === ''
    el.classList.toggle('bg-amber-50', empty)
  }

  // 保存した内容を画面に戻す
  const versionMismatch = !!draft && draft.layout_version !== layoutVersion
  useEffect(() => {
    if (!draft || versionMismatch) return
    const fs = fields()
    draft.values.e.forEach((v, i) => {
      const el = fs[i]
      if (!el) return
      el.innerText = v
      markEmpty(el)
    })
    const cs = checks()
    draft.values.c.forEach((v, i) => {
      const el = cs[i]
      if (el && (el.dataset.checked === 'true') !== v) el.click()
    })
    // 復元でのクリックを「変更」と数えない
    setTimeout(() => setStatus('idle'), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const collect = (): DraftValues => ({
    e: fields().map((el) => (el.innerText ?? '').replace(/\n$/, '')),
    c: checks().map((el) => el.dataset.checked === 'true'),
  })

  const save = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current)
    setStatus('saving')
    setError(null)
    const res = await saveContractDraft(draftKey, layoutVersion, collect())
    if (res.ok) {
      setStatus('saved')
      setSavedAt(res.savedAt ?? new Date().toISOString())
      setSavedBy(null)
    } else {
      setStatus('error')
      setError(res.error ?? '保存に失敗しました')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, layoutVersion])

  // 書き込み・チェックのたびに、手を止めて2秒後に自動保存
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const onChange = (e: Event) => {
      const t = e.target as HTMLElement
      // 書き込みは input、チェックは click だけを「変更」と数える
      const field = e.type === 'input' ? (t.closest?.('[data-e]') as HTMLElement | null) : null
      const check = e.type === 'click' ? t.closest?.('[data-check]') : null
      if (!field && !check) return
      if (field) markEmpty(field)
      setStatus('dirty')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => { void save() }, 2000)
    }
    root.addEventListener('input', onChange)
    root.addEventListener('click', onChange)
    return () => {
      root.removeEventListener('input', onChange)
      root.removeEventListener('click', onChange)
    }
  }, [save])

  // 保存前にページを閉じようとしたら止める
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (statusRef.current === 'dirty' || statusRef.current === 'saving') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [])

  const reset = async () => {
    if (!confirm('書き込んだ内容を消して、Livoに入っている情報だけの状態に戻します。よろしいですか?')) return
    if (timer.current) clearTimeout(timer.current)
    await resetContractDraft(draftKey)
    setStatus('idle')
    setSavedAt(null)
    window.location.reload()
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white/95 px-3 py-2 text-sm shadow-sm backdrop-blur print:hidden">
        <div className="flex items-center gap-2">
          {status === 'saving' && <><Loader2 className="h-4 w-4 animate-spin" />保存中...</>}
          {status === 'dirty' && <span className="text-amber-700">書き込み中(まもなく自動で保存します)</span>}
          {status === 'error' && <span className="text-destructive">{error}</span>}
          {(status === 'saved' || status === 'idle') && (
            savedAt ? (
              <span className="flex items-center gap-1 text-green-700">
                <Check className="h-4 w-4" />
                保存済み({fmt(savedAt)}{savedBy ? ` ${savedBy}` : ''})
              </span>
            ) : (
              <span className="text-muted-foreground">まだ保存していません(書き込むと自動で保存されます)</span>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={reset} disabled={!savedAt && status !== 'dirty'}>
            <RotateCcw className="mr-1 h-4 w-4" />Livoの情報に戻す
          </Button>
          <Button type="button" size="sm" onClick={() => void save()} disabled={status === 'saving'}>
            <Save className="mr-1 h-4 w-4" />今すぐ保存
          </Button>
        </div>
      </div>

      {versionMismatch && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive print:hidden">
          用紙の形が新しくなったため、以前保存した書き込みは表示できませんでした。お手数ですが書き直してください。
        </div>
      )}

      <div ref={ref}>{children}</div>
    </>
  )
}
