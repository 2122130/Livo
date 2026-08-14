'use client'

import Link from 'next/link'
import { EnterToNextForm } from '@/components/common/EnterToNextForm'
import {
  BUKKEN_CATEGORY_LABEL, TRADE_STATUS_LABEL,
  MANAGEMENT_TYPE_LABEL, TRANSACTION_TYPE_LABEL, LAND_STATUS_LABEL,
} from '@/constants/kbn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/common/SubmitButton'
import type { FormState } from '@/features/actions/lv201_sale_new'
import { useState, useActionState } from 'react'
import { LoadingLink } from '@/components/common/LoadingLink'

type SaleFormValues = {
  bukken_category?: number
  bukken_name?: string | null
  trade_status?: number | null
  management_type?: number
  price?: number | null
  address?: string | null
  transaction_type?: number | null
  // 詳細
  floor_plan?: string | null
  exclusive_area?: number | null
  yield_rate?: number | null
  total_floor_area?: number | null
  land_area?: number | null
  current_status?: number | null
}

function Select({ name, label, options, defaultValue, includeEmpty }: {
  name: string; label: string; options: Record<number, string>
  defaultValue?: number | null; includeEmpty?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue ?? ''}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm">
        {includeEmpty && <option value="">選択してください</option>}
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  )
}

export function SaleForm({
  action, backHref, values, submitLabel, categoryLocked,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  backHref: string
  values?: SaleFormValues
  submitLabel: string
  categoryLocked?: boolean   // 編集時は種別を変えられないようにする用
}) {
  const [category, setCategory] = useState<number>(values?.bukken_category ?? 1)
  const [state, formAction] = useActionState(action, { error: null })

  return (
    <EnterToNextForm action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      {/* 種別 */}
      <div className="space-y-1">
        <Label htmlFor="bukken_category">種別 *</Label>
        <select
          id="bukken_category"
          name="bukken_category"
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}
          disabled={categoryLocked}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm disabled:opacity-60"
        >
          {Object.entries(BUKKEN_CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {/* 編集で種別ロック時、値を送るための隠しフィールド */}
        {categoryLocked && <input type="hidden" name="bukken_category" value={category} />}
      </div>

      {/* 共通項目 */}
      <div className="space-y-1">
        <Label htmlFor="bukken_name">物件名</Label>
        <Input id="bukken_name" name="bukken_name" defaultValue={values?.bukken_name ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select name="trade_status" label="状態" options={TRADE_STATUS_LABEL}
          defaultValue={values?.trade_status} includeEmpty />
        <Select name="management_type" label="管理区分 *" options={MANAGEMENT_TYPE_LABEL}
          defaultValue={values?.management_type ?? 1} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="price">価格(円)</Label>
          <Input id="price" name="price" type="number" defaultValue={values?.price ?? ''} />
        </div>
        <Select name="transaction_type" label="取引態様" options={TRANSACTION_TYPE_LABEL}
          defaultValue={values?.transaction_type} includeEmpty />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">所在地</Label>
        <Input id="address" name="address" defaultValue={values?.address ?? ''} />
      </div>

      {/* 種別ごとの詳細項目 */}
      <div className="rounded-md border p-3 space-y-4">
        <p className="text-sm font-medium">{BUKKEN_CATEGORY_LABEL[category]}の詳細</p>

        {category === 1 && ( // マンション
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="floor_plan">間取り</Label>
              <Input id="floor_plan" name="floor_plan" defaultValue={values?.floor_plan ?? ''} placeholder="3LDK" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="exclusive_area">専有面積(㎡)</Label>
              <Input id="exclusive_area" name="exclusive_area" type="number" step="0.01" defaultValue={values?.exclusive_area ?? ''} />
            </div>
          </div>
        )}

        {category === 2 && ( // アパート
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="yield_rate">利回り(%)</Label>
              <Input id="yield_rate" name="yield_rate" type="number" step="0.01" defaultValue={values?.yield_rate ?? ''} placeholder="8.5" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="total_floor_area">延床面積(㎡)</Label>
              <Input id="total_floor_area" name="total_floor_area" type="number" step="0.01" defaultValue={values?.total_floor_area ?? ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="land_area">土地面積(㎡)</Label>
              <Input id="land_area" name="land_area" type="number" step="0.01" defaultValue={values?.land_area ?? ''} />
            </div>
          </div>
        )}

        {category === 3 && ( // 戸建て
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="floor_plan">間取り</Label>
              <Input id="floor_plan" name="floor_plan" defaultValue={values?.floor_plan ?? ''} placeholder="4LDK" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="total_floor_area">延床面積(㎡)</Label>
              <Input id="total_floor_area" name="total_floor_area" type="number" step="0.01" defaultValue={values?.total_floor_area ?? ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="land_area">土地面積(㎡)</Label>
              <Input id="land_area" name="land_area" type="number" step="0.01" defaultValue={values?.land_area ?? ''} />
            </div>
          </div>
        )}

        {category === 4 && ( // 土地
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="land_area">土地面積(㎡)</Label>
              <Input id="land_area" name="land_area" type="number" step="0.01" defaultValue={values?.land_area ?? ''} />
            </div>
            <Select name="current_status" label="現況" options={LAND_STATUS_LABEL}
              defaultValue={values?.current_status} includeEmpty />
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <Button asChild variant="outline" type="button">
          <LoadingLink href={backHref}>キャンセル</LoadingLink>
        </Button>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </EnterToNextForm>
  )
}