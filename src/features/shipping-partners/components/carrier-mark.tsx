import { useState } from "react";
import { cn } from "@/shared/lib/utils";

interface CarrierMarkProps {
  code: string;
  name: string;
  className?: string;
}

function carrierMonogram(name: string, code: string): string {
  const latin = code.replace(/[^a-z]/gi, "");
  if (latin.length >= 2) return latin.slice(0, 2).toUpperCase();
  if (latin.length === 1) return latin.toUpperCase();

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`;
  }

  return name.trim().slice(0, 1) || "?";
}

export function CarrierMark({ code, name, className }: CarrierMarkProps) {
  const [failed, setFailed] = useState(false);
  const initials = carrierMonogram(name, code);

  if (!failed) {
    return (
      <img
        src={`/carriers/${encodeURIComponent(code)}.svg`}
        alt=""
        width={40}
        height={40}
        className={cn(
          "size-10 rounded-lg border border-border/70 bg-card object-contain p-1",
          className,
        )}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 place-items-center rounded-lg bg-primary/10 text-xs font-semibold uppercase text-primary ring-1 ring-primary/15",
        className,
      )}
    >
      {initials}
    </span>
  );
}
