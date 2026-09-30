import { Skeleton } from "@/shared/components/ui";

export function ShippingPartnersPageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border/60 p-4"
          >
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
