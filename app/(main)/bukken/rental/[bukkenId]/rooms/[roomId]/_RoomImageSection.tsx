'use client'

import { useState } from 'react'
import { uploadRoomImage, deleteRoomImage } from '@/features/actions/lv112_room_image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteImageButton } from './_DeleteImageButton'
import { X } from 'lucide-react'

type RoomImage = {
  image_id: string
  storage_path: string
  title: string | null
  url: string | null
}

export function RoomImageSection({
  images, roomId, bukkenId,
}: {
  images: RoomImage[]
  roomId: string
  bukkenId: string
}) {
  // 拡大表示する画像(nullなら閉じている)
  const [zoomed, setZoomed] = useState<RoomImage | null>(null)

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">室内写真</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* アップロードフォーム(ファイル + タイトル) */}
        <form action={uploadRoomImage.bind(null, roomId, bukkenId)} className="space-y-2">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="block w-full text-sm file:mr-2 file:rounded-md file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="title"
              placeholder="タイトル(任意)例: リビング"
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
            />
            <Button type="submit" size="sm">アップロード</Button>
          </div>
        </form>

        {/* 画像グリッド */}
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">写真がまだありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div key={img.image_id} className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                  {img.url && (
                    <img
                      src={img.url}
                      alt={img.title ?? '室内写真'}
                      className="h-full w-full cursor-zoom-in object-cover transition hover:opacity-90"
                      onClick={() => setZoomed(img)}
                    />
                  )}
                  <div className="absolute right-1 top-1">
                    <DeleteImageButton
                      action={deleteRoomImage.bind(null, img.image_id, img.storage_path, roomId, bukkenId)}
                    />
                  </div>
                </div>
                {/* タイトル */}
                {img.title && (
                  <p className="truncate text-center text-xs text-slate-600">{img.title}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* 拡大表示(ライトボックス) */}
      {zoomed && zoomed.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => setZoomed(null)}
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img src={zoomed.url} alt={zoomed.title ?? '室内写真'} className="max-h-[85vh] w-auto rounded-lg" />
            {zoomed.title && (
              <p className="mt-2 text-center text-sm text-white">{zoomed.title}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}