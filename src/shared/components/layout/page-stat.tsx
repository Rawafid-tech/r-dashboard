import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageStatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function PageStat({ label, value, hint, className }: PageStatProps) {
  return (
    <div
      className={cn(
        "min-w-[7rem] rounded-lg border border-border bg-card px-4 py-3 text-end",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p dir="ltr" className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
