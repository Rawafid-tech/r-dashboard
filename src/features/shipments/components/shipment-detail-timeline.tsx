import {
  AlertTriangle,
  ArrowLeftRight,
  Ban,
  CheckCircle2,
  CircleDot,
  HelpCircle,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ShipmentIssueBadge } from "@/features/shipments/components/shipment-issue-badge";
import type {
  ShipmentTimelineEntry,
  ShipmentTimelineState,
} from "@/features/shipments/types";
import { Badge } from "@/shared/components/ui";
import { formatDateTime } from "@/shared/lib/formatters";
import { useSettings } from "@/features/account/hooks/use-settings";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface ShipmentDetailTimelineProps {
  entries: ShipmentTimelineEntry[] | null | undefined;
}

function timelineIcon(state: ShipmentTimelineState) {
  switch (state) {
    case "DELIVERED":
      return CheckCircle2;
    case "RETURNED":
      return RotateCcw;
    case "RETURNING":
    case "SWAPPED":
      return ArrowLeftRight;
    case "EXCEPTION":
      return AlertTriangle;
    case "LOST":
      return HelpCircle;
    case "CANCELLED":
      return Ban;
    case "AWAITING_PICKUP":
      return Package;
    case "IN_TRANSIT":
      return Truck;
    case "IGNORED":
    default:
      return CircleDot;
  }
}

export function ShipmentDetailTimeline({
  entries,
}: ShipmentDetailTimelineProps) {
  const { t } = useTranslation("shipments");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const settingsQuery = useSettings();
  const dateFormat = settingsQuery.data?.dateFormat ?? "DD_MM_YYYY";

  const visibleEntries = useMemo(
    () => (entries ?? []).filter((entry) => entry.state !== "IGNORED"),
    [entries],
  );

  if (visibleEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("detail.timeline.empty")}</p>
    );
  }

  return (
    <ol className="space-y-0" aria-label={t("detail.timeline.label")}>
      {visibleEntries.map((entry, index) => {
        const Icon = timelineIcon(entry.state);
        const isLatest = index === 0;
        const isLast = index === visibleEntries.length - 1;

        return (
          <li
            key={`${entry.state}-${entry.occurredAt}-${index}`}
            className="flex gap-3"
          >
            <div
              className="flex w-8 shrink-0 flex-col items-center self-stretch"
              aria-hidden="true"
            >
              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-background shadow-sm",
                  isLatest
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              {!isLast ? (
                <span className="mt-1 w-px min-h-6 flex-1 bg-border" />
              ) : null}
            </div>

            <div
              className={cn(
                "min-w-0 flex-1 space-y-1.5",
                isLast ? "pb-0" : "pb-8",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium leading-snug">
                  {t(`timeline.states.${entry.state}`)}
                </p>
                <Badge variant="outline" className="shrink-0 text-xs font-normal">
                  {entry.source === "WEBHOOK"
                    ? t("detail.timeline.sourceWebhook")
                    : t("detail.timeline.sourcePoll")}
                </Badge>
              </div>
              {entry.carrierState?.label ? (
                <p
                  dir="auto"
                  className="text-xs leading-relaxed text-muted-foreground break-words"
                >
                  {entry.carrierState.label}
                </p>
              ) : null}
              {entry.issue ? (
                <ShipmentIssueBadge issue={entry.issue} wrapReason className="max-w-full" />
              ) : null}
              <time
                className="block text-xs tabular-nums text-muted-foreground"
                dateTime={entry.occurredAt}
              >
                {formatDateTime(entry.occurredAt, dateFormat, intlLocale)}
              </time>
              {entry.source === "POLL" ? (
                <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                  {t("detail.timeline.pollHint")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
