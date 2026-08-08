import { createClient } from '@/lib/supabase/server'

// 部屋の画像一覧を、表示用の署名付きURL付きで取得
export async function getRoomImages(roomId: string) {
  const supabase = await createClient()

  // 画像レコードを取得
  const { data: images } = await supabase
    .from('t210_room_image')
    .select('image_id, storage_path, title, sort_order') 
    .eq('room_id', roomId)
    .eq('mukou_kbn', 0)
    .order('sort_order')

  if (!images || images.length === 0) return []

  // 各画像の署名付きURLを発行(1時間有効)
  const withUrls = await Promise.all(
    images.map(async (img) => {
      const { data } = await supabase.storage
        .from('room-images')
        .createSignedUrl(img.storage_path, 3600)
      return {
        image_id: img.image_id,
        storage_path: img.storage_path,
        title: img.title,             // ← 追加
        url: data?.signedUrl ?? null,
      }
    })
  )

  return withUrls
}