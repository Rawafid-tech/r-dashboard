import { Skeleton } from "@/shared/components/ui";

export function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-[4.25rem] w-28 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
