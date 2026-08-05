import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import type { PermissionKind } from "@/features/roles/types";

interface PermissionKindBadgeProps {
  kind: PermissionKind;
  className?: string;
}

export function PermissionKindBadge({
  kind,
  className,
}: PermissionKindBadgeProps) {
  const { t } = useTranslation("roles");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
        kind === "PAGE"
          ? "border-violet-500/70 bg-violet-500/10 text-violet-700 dark:text-violet-300"
          : "border-emerald-500/70 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        className,
      )}
    >
      {t(`kind.${kind}`)}
    </span>
  );
}
