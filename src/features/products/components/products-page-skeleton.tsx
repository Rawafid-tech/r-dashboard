import { Skeleton } from "@/shared/components/ui";

export function ProductsPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}
