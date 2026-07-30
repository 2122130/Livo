'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnterToNextForm } from '@/components/common/EnterToNextForm'
import {
  TAIOU_KBN_LABEL, TAIOU_STATUS_LABEL, BUKKEN_KBN_LABEL,
} from '@/constants/kbn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/common/SubmitButton'
import { useActionState } from 'react'
import type { FormState } from '@/features/actions/lv801_inquiry_new'

type Option = { bukken_id: string; label: string }
type Room = { room_id: string; bukken_id: string; room_number: string }
type Account = { account_id: string; name: string }

type Values = {
  bukken_kbn?: number
  bukken_id?: string
  room_id?: string | null
  taiou_kbn?: number
  status_kbn?: number
  uketsuke_date?: string
  customer_name?: string | null
  customer_tel?: string | null
  title?: string | null
  content?: string
  uketsuke_account_id?: string
  tantou_account_id?: string | null
  bikou?: string | null
}

export function InquiryForm({
  action, backHref, submitLabel, options, values, defaultAccountId,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  backHref: string
  submitLabel: string
  options: { rentals: Option[]; sales: Option[]; rooms: Room[]; accounts: Account[] }
  values?: Values
  defaultAccountId?: string   // 受付者の初期値(ログイン中のアカウント)
}) {
  const [bukkenKbn, setBukkenKbn] = useState<number>(values?.bukken_kbn ?? 1)
  const [bukkenId, setBukkenId] = useState<string>(values?.bukken_id ?? '')
  const [state, formAction] = useActionState(action, { error: null }) 

  // 物件区分に応じた物件リスト
  const bukkenOptions = bukkenKbn === 1 ? options.rentals : options.sales
  // 選択中の賃貸物件に属する部屋
  const roomOptions = bukkenKbn === 1
    ? options.rooms.filter((r) => r.bukken_id === bukkenId)
    : []

  return (
    <EnterToNextForm action={formAction} className="space-y-5">
      {/* エラーメッセージ */}
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* 物件区分(ラジオボタン) */}
      <div className="space-y-2">
        <Label>物件区分 *</Label>
        <div className="flex gap-6">
          {Object.entries(BUKKEN_KBN_LABEL).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="bukken_kbn"
                value={v}
                checked={bukkenKbn === Number(v)}
                onChange={() => { setBukkenKbn(Number(v)); setBukkenId('') }}
                className="h-4 w-4"
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      {/* 受付日・進捗 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="uketsuke_date">受付日 *</Label>
          <Input id="uketsuke_date" name="uketsuke_date" type="date" required
            defaultValue={values?.uketsuke_date ?? new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status_kbn">進捗 *</Label>
          <select id="status_kbn" name="status_kbn" required defaultValue={values?.status_kbn ?? 1}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            {Object.entries(TAIOU_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 物件名・部屋 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="bukken_id">物件名 *</Label>
          <select id="bukken_id" name="bukken_id" required value={bukkenId}
            onChange={(e) => setBukkenId(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {bukkenOptions.map((b) => (
              <option key={b.bukken_id} value={b.bukken_id}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="room_id">部屋</Label>
          {bukkenKbn === 1 ? (
            <>
              <select id="room_id" name="room_id" defaultValue={values?.room_id ?? ''}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">指定しない</option>
                {roomOptions.map((r) => (
                  <option key={r.room_id} value={r.room_id}>{r.room_number}</option>
                ))}
              </select>
              {bukkenId === '' && (
                <p className="text-xs text-muted-foreground">物件を選ぶと部屋が選べます</p>
              )}
            </>
          ) : (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              売買物件には部屋がありません
            </div>
          )}
        </div>
      </div>

      {/* 相談者名・対応区分 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="customer_name">相談者名</Label>
          <Input id="customer_name" name="customer_name" defaultValue={values?.customer_name ?? ''} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="taiou_kbn">対応区分 *</Label>
          <select id="taiou_kbn" name="taiou_kbn" required defaultValue={values?.taiou_kbn ?? 1}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            {Object.entries(TAIOU_KBN_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 件名 */}
      <div className="space-y-1">
        <Label htmlFor="title">件名</Label>
        <Input id="title" name="title" defaultValue={values?.title ?? ''}
          placeholder="エアコン故障の連絡" />
      </div>

      {/* 対応内容 */}
      <div className="space-y-1">
        <Label htmlFor="content">対応内容 *</Label>
        <textarea id="content" name="content" required rows={4}
          defaultValue={values?.content ?? ''}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      {/* 受付者・担当者 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="uketsuke_account_id">受付者 *</Label>
          <select id="uketsuke_account_id" name="uketsuke_account_id" required
            defaultValue={values?.uketsuke_account_id ?? defaultAccountId ?? ''}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {options.accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="tantou_account_id">担当者</Label>
          <select id="tantou_account_id" name="tantou_account_id"
            defaultValue={values?.tantou_account_id ?? ''}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">未アサイン</option>
            {options.accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 備考 */}
      <div className="space-y-1">
        <Label htmlFor="bikou">備考</Label>
        <textarea id="bikou" name="bikou" rows={2}
          defaultValue={values?.bikou ?? ''}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button asChild variant="outline" type="button">
          <Link href={backHref}>キャンセル</Link>
        </Button>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </EnterToNextForm>
  )
}