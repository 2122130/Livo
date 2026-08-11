// 'YYYY-MM-DD' または Date → 'R8/8/1' 形式(令和のみ簡易対応)
export function toWareki(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr  // 変換できなければそのまま

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  // 令和: 2019年5月1日〜
  if (year > 2019 || (year === 2019 && month >= 5)) {
    const r = year - 2018  // 2019=令和1
    return `R${r}/${month}/${day}`
  }
  // 平成: 1989年1月8日〜2019年4月30日
  if (year > 1989 || (year === 1989 && (d.getMonth() + 1) >= 1)) {
    const h = year - 1988  // 1989=平成1
    return `H${h}/${month}/${day}`
  }
  // それ以前は西暦のまま
  return `${year}/${month}/${day}`
}