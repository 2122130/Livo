export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-8 py-6 shadow-lg backdrop-blur-md">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-medium text-slate-700">Loading...</p>
      </div>
    </div>
  )
}