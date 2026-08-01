import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

export function RawafidLogoMark({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-md bg-sidebar-primary/10 text-sidebar-primary ring-1 ring-sidebar-primary/15",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path
          d="M4 20c4-8 8-8 12 0s8 8 12 0"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M4 12c4-8 8-8 12 0s8 8 12 0"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}
