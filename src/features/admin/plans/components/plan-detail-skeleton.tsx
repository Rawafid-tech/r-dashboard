import { Skeleton } from "@/shared/components/ui";

export function PlanDetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-3 rounded-2xl border border-border/60 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-xl border border-border/60 p-6"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
