import { Skeleton } from "@/shared/components/ui";

export function CompaniesPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-3 rounded-2xl border border-border/60 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="space-y-0 border-b border-border/60 bg-muted/20 p-4">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-border/40 p-4 last:border-b-0"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
