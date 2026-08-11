'use client'

import { useState } from 'react'
import { FileText, Image as ImageIcon, Trash2, Upload, X, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { uploadTenancyFile, deleteTenancyFile } from '@/features/actions/lv113_tenancy_file'

type TenancyFile = {
  file_id: string
  file_category: number
  storage_path: string
  file_name: string | null
  url: string | null
}

const CATEGORY = { CONTRACT: 1, PHOTO: 2 } as const

export function FileModal({
  tenancyId,
  roomId,
  bukkenId,
  tenantName,
  files,
  triggerLabel = '資料',
  triggerVariant = 'outline',
}: {
  tenancyId: string
  roomId: string
  bukkenId: string
  tenantName: string
  files: TenancyFile[]
  triggerLabel?: string
  triggerVariant?: 'outline' | 'default' | 'ghost'
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<number>(CATEGORY.CONTRACT)
  const [zoomed, setZoomed] = useState<TenancyFile | null>(null)

  const contractFiles = files.filter((f) => f.file_category === CATEGORY.CONTRACT)
  const photoFiles = files.filter((f) => f.file_category === CATEGORY.PHOTO)
  const shownFiles = tab === CATEGORY.CONTRACT ? contractFiles : photoFiles

  const isImage = (name: string | null) => !!name && /\.(jpg|jpeg|png|gif|webp)$/i.test(name)
  const isPdf = (name: string | null) => !!name && /\.pdf$/i.test(name)

  return (
    <>
      <Button variant={triggerVariant} size="sm" onClick={() => setOpen(true)}>
        <FolderOpen className="mr-1 h-4 w-4" />
        {triggerLabel}
        {files.length > 0 && (
          <span className="ml-1 rounded-full bg-emerald-100 px-1.5 text-xs text-emerald-700">
            {files.length}
          </span>
        )}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`資料 - ${tenantName}`}>
        <div className="space-y-4">
          {/* タブ */}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button onClick={() => setTab(CATEGORY.CONTRACT)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === CATEGORY.CONTRACT ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}>
              <FileText className="mr-1 inline h-4 w-4" />契約書 ({contractFiles.length})
            </button>
            <button onClick={() => setTab(CATEGORY.PHOTO)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === CATEGORY.PHOTO ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}>
              <ImageIcon className="mr-1 inline h-4 w-4" />写真 ({photoFiles.length})
            </button>
          </div>

          {/* アップロード */}
          <form action={uploadTenancyFile.bind(null, tenancyId, roomId, bukkenId, tab)}
            className="flex items-center gap-2">
            <input type="file" name="file" multiple
              accept={tab === CATEGORY.CONTRACT ? 'application/pdf,image/*' : 'image/*'}
              required
              className="flex-1 text-sm file:mr-2 file:rounded-md file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-sm" />
            <Button type="submit" size="sm"><Upload className="mr-1 h-4 w-4" />追加</Button>
          </form>

          {/* ファイル一覧 */}
          {shownFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tab === CATEGORY.CONTRACT ? '契約書' : '写真'}がまだありません
            </p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {shownFiles.map((f) => (
                <div key={f.file_id} className="flex items-center gap-3 p-2 hover:bg-slate-50">
                  <button onClick={() => setZoomed(f)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                    {isImage(f.file_name) && f.url ? (
                      <img src={f.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-6 w-6 text-slate-400" />
                    )}
                  </button>
                  <button onClick={() => setZoomed(f)}
                    className="flex-1 truncate text-left text-sm hover:underline">
                    {f.file_name ?? '(名称不明)'}
                  </button>
                  <form action={deleteTenancyFile.bind(null, f.file_id, f.storage_path, roomId, bukkenId)}
                    onSubmit={(e) => {
                      if (!confirm(`「${f.file_name ?? 'このファイル'}」を削除しますか?`)) e.preventDefault()
                    }}>
                    <button type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="削除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* 拡大表示(モーダルより前面) */}
      {zoomed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(null)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => setZoomed(null)} aria-label="閉じる">
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {isImage(zoomed.file_name) && zoomed.url ? (
              <img src={zoomed.url} alt="" className="mx-auto max-h-[85vh] w-auto rounded-lg" />
            ) : isPdf(zoomed.file_name) && zoomed.url ? (
              <iframe src={zoomed.url} className="h-[85vh] w-full rounded-lg bg-white" />
            ) : (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="mb-4">{zoomed.file_name}</p>
                {zoomed.url && (
                  <a href={zoomed.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">ダウンロード</a>
                )}
              </div>
            )}
            <p className="mt-2 text-center text-sm text-white">{zoomed.file_name}</p>
          </div>
        </div>
      )}
    </>
  )
}