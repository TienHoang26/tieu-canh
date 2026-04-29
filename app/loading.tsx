export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="h-10 bg-stone-200 rounded-xl w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-stone-100 rounded-lg w-48 mb-10 animate-pulse" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
              <div className="aspect-square bg-stone-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-stone-200 rounded w-2/3" />
                <div className="h-4 bg-stone-200 rounded" />
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-6 bg-stone-200 rounded w-1/2 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
