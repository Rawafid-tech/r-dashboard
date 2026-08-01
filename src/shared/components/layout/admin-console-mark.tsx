import { ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function AdminConsoleMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15",
        className,
      )}
      aria-hidden="true"
    >
      <ShieldCheck className="size-4" />
    </span>
  );
}
