import { Skeleton } from "@/shared/components/ui";

export function OrdersPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
