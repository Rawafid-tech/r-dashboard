import { Skeleton } from "@/shared/components/ui";

export function ShipmentsPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
