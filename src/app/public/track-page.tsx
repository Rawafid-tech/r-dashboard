import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Copy,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Truck,
  Undo2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { resolvePublicMediaUrl } from "@/features/media/lib/resolve-public-media-url";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { isTrackingNotFound, usePublicTracking } from "@/features/tracking/hooks/use-public-tracking";
import {
  statusLabelKey,
  statusTone,
  stepLabelKey,
  type StatusTone,
} from "@/features/tracking/lib/tracking-labels";
import type { PublicTracking, PublicTrackingStatus } from "@/features/tracking/types";
import { RawafidLogo } from "@/shared/components/layout/rawafid-logo-mark";
import { Button, Skeleton } from "@/shared/components/ui";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

/**
 * Public shipment tracking for the store's customer (docs/2026-11-21-public-tracking-page.md).
 * Opened from a shipping email on a phone: no login, mobile first, Arabic and English. Shows only what
 * the anonymous endpoint returns; never the customer's name, phone, address, COD amount or order number.
 *
 * Note: this project redefines `max-w-md` as 1024px (design-system.css), so the column width is set
 * with an explicit value.
 */

/** Colours per status family: the hero band, the icon disc, the reached steps. */
const TONE: Record<StatusTone, { band: string; disc: string; text: string; fill: string; ring: string }> = {
  progress: {
    band: "from-primary/15 via-primary/5",
    disc: "bg-primary text-primary-foreground",
    text: "text-foreground",
    fill: "bg-primary",
    ring: "ring-primary/30",
  },
  success: {
    band: "from-success/20 via-success/5",
    disc: "bg-success text-white",
    text: "text-success-text dark:text-success",
    fill: "bg-success",
    ring: "ring-success/30",
  },
  warning: {
    band: "from-warning/20 via-warning/5",
    disc: "bg-warning text-white",
    text: "text-warning-text dark:text-warning",
    fill: "bg-warning",
    ring: "ring-warning/30",
  },
  danger: {
    band: "from-destructive/20 via-destructive/5",
    disc: "bg-destructive text-white",
    text: "text-destructive-text dark:text-destructive",
    fill: "bg-destructive",
    ring: "ring-destructive/30",
  },
};

const STATUS_ICON: Record<PublicTrackingStatus, ComponentType<{ className?: string }>> = {
  BOOKING: Clock3,
  BOOKED: Clock3,
  IN_TRANSIT: Truck,
  RETURNING: Undo2,
  DELIVERED: PackageCheck,
  RETURNED: RotateCcw,
  LOST: AlertTriangle,
  FAILED: AlertTriangle,
  CANCELLED: AlertTriangle,
};

/** Latin digits in both languages, so dates read like the tracking number next to them. */
function intlLocale(locale: string) {
  return locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB";
}

export function TrackPage() {
  const { code = "" } = useParams<{ code: string }>();
  const { t } = useTranslation("tracking");
  const locale = useLocaleStore((state) => state.locale);
  const query = usePublicTracking(code, locale);
  const data = query.data;

  useDocumentMeta(
    data?.company ? t("meta.titleFor", { company: data.company.name }) : t("meta.title"),
    t("meta.description"),
  );

  const tone = data ? statusTone(data.status) : "progress";

  return (
    <div className="relative min-h-svh overflow-hidden bg-muted/40">
      {/* Soft wash of the status colour behind the top of the page. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b to-transparent",
          TONE[tone].band,
        )}
      />

      {/* The project's page container (same as every dashboard page). */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-3">
          <RawafidLogo className="h-8 text-foreground sm:h-9" />
          <AuthLocaleThemeControls />
        </header>

        <main>
          {query.isLoading ? (
            <TrackSkeleton />
          ) : query.isError ? (
            <TrackError notFound={isTrackingNotFound(query.error)} onRetry={() => void query.refetch()} />
          ) : data ? (
            // Wide screens: status and progress on the main side, the details beside them.
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6">
              <TrackDetails
                data={data}
                locale={locale}
                refreshing={query.isFetching}
                onRefresh={() => void query.refetch()}
              />
            </div>
          ) : null}
        </main>

        <footer className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <span>{t("poweredBy")}</span>
        </footer>
      </div>
    </div>
  );
}

function TrackSkeleton() {
  const { t } = useTranslation("tracking");
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6" role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

function TrackError({ notFound, onRetry }: { notFound: boolean; onRetry: () => void }) {
  const { t } = useTranslation("tracking");
  return (
    <section
      className="mx-auto flex w-full max-w-[36rem] flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-12 text-center shadow-sm"
      role="alert"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-muted">
        <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold">{notFound ? t("notFound.title") : t("error.title")}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {notFound ? t("notFound.body") : t("error.body")}
        </p>
      </div>
      {!notFound ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          {t("refresh")}
        </Button>
      ) : null}
    </section>
  );
}

function TrackDetails({
  data,
  locale,
  refreshing,
  onRefresh,
}: {
  data: PublicTracking;
  locale: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { t } = useTranslation("tracking");
  const tone = TONE[statusTone(data.status)];
  const StatusIcon = STATUS_ICON[data.status];
  const companyLogo = resolvePublicMediaUrl(data.company?.logoUrl);
  const carrierName = data.carrier ? (locale === "ar" ? data.carrier.nameAr : data.carrier.nameEn) : null;

  const formats = useMemo(
    () => ({
      step: new Intl.DateTimeFormat(intlLocale(locale), {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
      full: new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" }),
    }),
    [locale],
  );

  // The first step not reached yet is "next"; it gets a soft highlight.
  const nextIndex = data.steps.findIndex((step) => step.at === null);
  const reachedCount = nextIndex === -1 ? data.steps.length : nextIndex;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-labelledby="track-status">
        <div className="space-y-6 p-5 sm:p-8 lg:space-y-8">
          {data.company ? (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 rounded-md border bg-background object-contain p-0.5"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground"
                >
                  {data.company.name.trim().slice(0, 1).toUpperCase()}
                </span>
              )}
              <p className="min-w-0 truncate">
                {t("orderFrom")} <span className="font-medium text-foreground">{data.company.name}</span>
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-full shadow-sm ring-8 lg:size-16",
                tone.disc,
                tone.ring,
              )}
            >
              <StatusIcon className="size-7 lg:size-8" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <h1 id="track-status" className={cn("text-xl font-bold leading-snug sm:text-2xl lg:text-3xl", tone.text)}>
                {t(statusLabelKey(data.status))}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`statusHint.${data.status}`)}</p>
            </div>
          </div>

          <ProgressSteps
            steps={data.steps}
            kind={data.kind}
            reachedCount={reachedCount}
            fillClass={tone.fill}
            format={formats.step}
          />
        </div>

        {data.hasIssue ? (
          <div role="status" className="flex gap-3 border-t border-warning/30 bg-warning/10 px-5 py-4 text-sm sm:px-8">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-text dark:text-warning" aria-hidden="true" />
            <p className="leading-relaxed text-foreground">{t("issue")}</p>
          </div>
        ) : null}
      </section>

      <section className="divide-y rounded-2xl border bg-card shadow-sm" aria-label={t("detailsLabel")}>
        {data.carrier && carrierName ? (
          <div className="flex items-center gap-3 p-5 sm:px-6">
            <CarrierMark code="" name={carrierName} logoUrl={data.carrier.logoUrl} className="size-11" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("carrier")}</p>
              <p className="truncate font-semibold">{carrierName}</p>
            </div>
          </div>
        ) : null}

        <TrackingNumberRow trackingNumber={data.trackingNumber} />

        {data.attempts > 0 ? (
          <div className="flex items-center gap-3 px-5 py-4 text-sm sm:px-6">
            <Truck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p>{t("attempts", { count: data.attempts })}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <p className="flex min-w-0 items-start gap-2 text-xs leading-snug text-muted-foreground">
            <Clock3 className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {data.lastUpdateAt ? (
              <span>
                {t("lastUpdate")}{" "}
                <time dateTime={data.lastUpdateAt}>{formats.full.format(new Date(data.lastUpdateAt))}</time>
              </span>
            ) : (
              <span>{t("noUpdateYet")}</span>
            )}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw data-icon="inline-start" className={cn(refreshing && "animate-spin")} />
            {t("refresh")}
          </Button>
        </div>
      </section>
    </>
  );
}

/** Three nodes on a line: filled up to the last reached step, the next one softly highlighted. */
function ProgressSteps({
  steps,
  kind,
  reachedCount,
  fillClass,
  format,
}: {
  steps: PublicTracking["steps"];
  kind: PublicTracking["kind"];
  reachedCount: number;
  fillClass: string;
  format: Intl.DateTimeFormat;
}) {
  const { t } = useTranslation("tracking");
  const count = steps.length;
  // Share of the line between the first and the last node that is filled.
  const filled = count > 1 ? Math.max(0, Math.min(1, (reachedCount - 1) / (count - 1))) : 0;

  return (
    <ol className="relative grid pt-1" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-label={t("progressLabel")}>
      {/* The track between the first and last node centres, and its filled part (logical, RTL-aware). */}
      <span
        aria-hidden="true"
        className="absolute top-[1.125rem] h-1 rounded-full bg-foreground/10 dark:bg-foreground/15"
        style={{ insetInlineStart: `${50 / count}%`, insetInlineEnd: `${50 / count}%` }}
      />
      <span
        aria-hidden="true"
        className={cn("absolute top-[1.125rem] h-1 rounded-full transition-all duration-500", fillClass)}
        style={{
          insetInlineStart: `${50 / count}%`,
          width: `calc(${filled} * (100% - ${100 / count}%))`,
        }}
      />
      {steps.map((step, index) => {
        const reached = step.at !== null;
        const isNext = index === reachedCount;
        return (
          <li key={`${step.step}-${index}`} className="relative flex flex-col items-center gap-2 px-1 text-center">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full border-2 bg-card",
                reached && cn("border-transparent text-white", fillClass),
                !reached && isNext && "border-foreground/40",
                !reached && !isNext && "border-border",
              )}
            >
              {reached ? (
                <Check className="size-4" strokeWidth={3} aria-hidden="true" />
              ) : (
                <span className={cn("size-2 rounded-full", isNext ? "bg-foreground/50" : "bg-border")} />
              )}
            </span>
            <div className="space-y-0.5">
              <p className={cn("text-xs font-medium leading-tight sm:text-sm", !reached && "text-muted-foreground")}>
                {t(stepLabelKey(step.step, kind))}
                <span className="sr-only"> — {reached ? t("stepDone") : t("stepPending")}</span>
              </p>
              {step.at ? (
                <p className="text-[0.6875rem] text-muted-foreground sm:text-xs">
                  <time dateTime={step.at}>{format.format(new Date(step.at))}</time>
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TrackingNumberRow({ trackingNumber }: { trackingNumber: string | null }) {
  const { t } = useTranslation("tracking");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-5 sm:px-6">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{t("trackingNumber")}</p>
        <p className="truncate font-mono text-lg font-semibold tracking-wider" dir="ltr">
          {trackingNumber ?? <span className="font-sans text-sm font-normal text-muted-foreground">{t("trackingNumberPending")}</span>}
        </p>
      </div>
      {trackingNumber ? (
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()} aria-live="polite">
          {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copied ? t("copiedShort") : t("copy")}
        </Button>
      ) : null}
    </div>
  );
}
