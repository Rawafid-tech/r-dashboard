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
    <ol
      className="relative space-y-0 border-s border-border ps-6"
      aria-label={t("detail.timeline.label")}
    >
      {visibleEntries.map((entry, index) => {
        const Icon = timelineIcon(entry.state);
        const isLatest = index === 0;

        return (
          <li
            key={`${entry.state}-${entry.occurredAt}-${index}`}
            className="relative pb-6 last:pb-0"
          >
            <span
              className={cn(
                "absolute -start-[calc(0.75rem+1px)] top-0.5 grid size-6 place-items-center rounded-full border bg-background",
                isLatest ? "border-primary text-primary" : "border-border text-muted-foreground",
              )}
              aria-hidden="true"
            >
              <Icon className="size-3.5" />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">
                  {t(`timeline.states.${entry.state}`)}
                </p>
                <Badge variant="outline" className="text-xs font-normal">
                  {entry.source === "WEBHOOK"
                    ? t("detail.timeline.sourceWebhook")
                    : t("detail.timeline.sourcePoll")}
                </Badge>
              </div>
              {entry.carrierState?.label ? (
                <p className="text-xs text-muted-foreground">
                  {entry.carrierState.label}
                </p>
              ) : null}
              {entry.issue ? (
                <ShipmentIssueBadge issue={entry.issue} className="max-w-full" />
              ) : null}
              <time
                className="block text-xs tabular-nums text-muted-foreground"
                dateTime={entry.occurredAt}
              >
                {formatDateTime(entry.occurredAt, dateFormat, intlLocale)}
              </time>
              {entry.source === "POLL" ? (
                <p className="text-xs text-muted-foreground">
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
