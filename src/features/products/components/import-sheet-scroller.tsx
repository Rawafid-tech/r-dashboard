import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ImportSheetScrollerProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function excelColumnName(index: number): string {
  let position = index + 1;
  let name = "";

  while (position > 0) {
    const remainder = (position - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    position = Math.floor((position - 1) / 26);
  }

  return name;
}

export function ImportSheetScroller({
  label,
  children,
  className,
}: ImportSheetScrollerProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
