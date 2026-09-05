/**
 * Loading skeletons matching the real card/page shapes, so page
 * transitions feel instant instead of blank (transitions.dev pattern).
 * The shimmer lives in globals.css `.skeleton` and respects
 * prefers-reduced-motion.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** One card placeholder that mirrors ItemCard's cover layout. */
export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="aspect-[16/10]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Grid of card skeletons — same columns as ItemGrid/RevealGrid. */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-label="جاري التحميل"
    >
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** /search placeholder: search bar + counter + results grid. */
export function SearchLoading() {
  return (
    <section className="container py-8" aria-busy="true">
      <div className="h-[3.4rem] rounded-2xl" aria-hidden>
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-4">
        <GridSkeleton count={8} />
      </div>
    </section>
  );
}

/** /item/[id] placeholder: badges + title + player + article lines. */
export function ItemLoading() {
  return (
    <div className="container py-8 max-w-3xl" aria-busy="true" role="status" aria-label="جاري التحميل">
      <div className="flex gap-2" aria-hidden>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-4 space-y-2.5" aria-hidden>
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
      </div>
      <div className="mt-6 aspect-video rounded-2xl" aria-hidden>
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
      <div className="mt-8 space-y-3" aria-hidden>
        {["w-full", "w-11/12", "w-full", "w-10/12", "w-full", "w-8/12"].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
    </div>
  );
}
