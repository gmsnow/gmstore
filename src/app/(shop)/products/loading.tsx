export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title skeleton */}
      <div className="h-8 w-40 rounded-lg bg-muted animate-pulse mb-8" />

      {/* Filter pills skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
      </div>

      {/* Category pills skeleton */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-22 rounded-full bg-muted animate-pulse" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-xl bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
