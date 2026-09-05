import { GridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8" aria-busy="true">
      <div className="space-y-3" aria-hidden>
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="mt-8">
        <GridSkeleton count={8} />
      </div>
    </div>
  );
}
