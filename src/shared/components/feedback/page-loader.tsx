import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { cn } from "@/shared/lib/utils";

/** Fallback while a lazy page loads; fills the content area, not the shell. */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[50dvh] w-full items-center justify-center",
        className,
      )}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
}
