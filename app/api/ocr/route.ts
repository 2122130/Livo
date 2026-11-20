import { NextResponse } from 'next/server'
import { getMyAccount } from '@/features/auth/get-my-account'

// 画像・PDFを読み取り、フォームの項目に当てはまる値を返す。
// 読み取りは Claude(Anthropic API)を使う。Vercel の環境変数 ANTHROPIC_API_KEY が必要。

export const maxDuration = 60

type FieldSpec = {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: Record<string, string>   // select の場合: 値 → 表示名
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 4 * 1024 * 1024

export async function POST(req: Request) {
  const account = await getMyAccount()
  if (!account) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: '読み取り機能の設定(ANTHROPIC_API_KEY)がまだです。管理者に連絡してください。' },
      { status: 500 },
    )
  }

  const form = await req.formData()
  const file = form.get('file')
  const fieldsRaw = form.get('fields')
  if (!(file instanceof File) || typeof fieldsRaw !== 'string') {
    return NextResponse.json({ error: 'ファイルが送られていません' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'ファイルが大きすぎます(4MBまで)' }, { status: 400 })
  }

  let fields: FieldSpec[]
  try {
    fields = JSON.parse(fieldsRaw)
  } catch {
    return NextResponse.json({ error: '項目の指定が不正です' }, { status: 400 })
  }

  const isPdf = file.type === 'application/pdf'
  if (!isPdf && !IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: '画像(JPEG/PNG)かPDFを選んでください' }, { status: 400 })
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  const fieldLines = fields.map((f) => {
    let line = `- "${f.name}": ${f.label}`
    if (f.type === 'number') line += '(半角数字のみ。円・㎡・カンマは付けない。「6万円」は60000)'
    if (f.type === 'date') line += '(YYYY-MM-DD形式。和暦は西暦に直す)'
    if (f.type === 'select' && f.options) {
      line += `(次のどれかの「値」で答える: ${Object.entries(f.options).map(([v, l]) => `${v}=${l}`).join(', ')})`
    }
    return line
  }).join('\n')

  const prompt = `この書類(不動産の資料・申込書・手書きのメモなど)から、次の項目の値を読み取ってください。

${fieldLines}

ルール:
- 書類に書かれていない項目は出力しない。推測で埋めない。
- 手書きで読みにくい文字は、最も可能性が高い読みを使う。
- 出力はJSONオブジェクト1つだけ。説明文やコードブロックは付けない。
- 例: {"bukken_name": "サンハイツ大塚", "rent": "58000"}`

  const content = [
    isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
    { type: 'text', text: prompt },
  ]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!res.ok) {
    console.error('OCR error', res.status, await res.text())
    return NextResponse.json({ error: '読み取りに失敗しました。時間をおいて再度お試しください。' }, { status: 502 })
  }

  const data = await res.json()
  const text: string = (data.content ?? [])
    .filter((c: { type: string }) => c.type === 'text')
    .map((c: { text: string }) => c.text)
    .join('')

  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ values: {} })

  let values: Record<string, unknown> = {}
  try {
    values = JSON.parse(match[0])
  } catch {
    return NextResponse.json({ values: {} })
  }

  // 指定した項目だけに絞る
  const allowed = new Set(fields.map((f) => f.name))
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(values)) {
    if (allowed.has(k) && v !== null && v !== undefined && String(v).trim() !== '') {
      out[k] = String(v).trim()
    }
  }
  return NextResponse.json({ values: out })
}
