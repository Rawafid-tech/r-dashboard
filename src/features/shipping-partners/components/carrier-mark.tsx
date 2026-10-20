import { useEffect, useMemo, useState } from "react";
import { resolvePublicMediaUrl } from "@/features/media/lib/resolve-public-media-url";
import { cn } from "@/shared/lib/utils";

interface CarrierMarkProps {
  code: string;
  name: string;
  logoUrl?: string | null;
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

export function CarrierMark({
  code,
  name,
  logoUrl,
  className,
}: CarrierMarkProps) {
  const [failed, setFailed] = useState(false);
  const initials = carrierMonogram(name, code);
  const resolvedSrc = useMemo(
    () => resolvePublicMediaUrl(logoUrl),
    [logoUrl],
  );

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  const showImage = Boolean(resolvedSrc) && !failed;

  if (showImage) {
    return (
      <img
        src={resolvedSrc!}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
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
