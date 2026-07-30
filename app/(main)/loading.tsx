export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-muted-foreground">
        <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">読み込み中...</span>
      </div>
    </div>
  )
}