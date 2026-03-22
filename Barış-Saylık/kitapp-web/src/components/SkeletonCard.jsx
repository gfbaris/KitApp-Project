const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-slate-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/3 mt-3" />
    </div>
  </div>
)

export default SkeletonCard
