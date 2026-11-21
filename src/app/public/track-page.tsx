import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Circle, Copy, Loader2, PackageSearch, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { resolvePublicMediaUrl } from "@/features/media/lib/resolve-public-media-url";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { isTrackingNotFound, usePublicTracking } from "@/features/tracking/hooks/use-public-tracking";
import { statusLabelKey, statusTone, stepLabelKey, type StatusTone } from "@/features/tracking/lib/tracking-labels";
import type { PublicTracking } from "@/features/tracking/types";
import { Button } from "@/shared/components/ui";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-destructive",
  progress: "text-foreground",
};

/**
 * Public shipment tracking for the store's customer (docs/2026-11-21-public-tracking-page.md).
 * Opened from a shipping email on a phone: no login, mobile first, Arabic and English. Shows only what
 * the anonymous endpoint returns; never the customer's name, phone, address, COD amount or order number.
 */
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

  const dateTime = useMemo(
    () => new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );

  return (
    <div className="min-h-svh bg-muted/30">
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <div className="flex justify-end">
          <AuthLocaleThemeControls />
        </div>

        {query.isLoading ? (
          <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("loading")}
          </p>
        ) : query.isError ? (
          <TrackError notFound={isTrackingNotFound(query.error)} onRetry={() => void query.refetch()} />
        ) : data ? (
          <TrackDetails
            data={data}
            locale={locale}
            dateTime={dateTime}
            refreshing={query.isFetching}
            onRefresh={() => void query.refetch()}
          />
        ) : null}

        <p className="pt-2 text-center text-xs text-muted-foreground">{t("poweredBy")}</p>
      </main>
    </div>
  );
}

function TrackError({ notFound, onRetry }: { notFound: boolean; onRetry: () => void }) {
  const { t } = useTranslation("tracking");
  return (
    <section className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center" role="alert">
      <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-base font-semibold">{notFound ? t("notFound.title") : t("error.title")}</h1>
      <p className="text-sm text-muted-foreground">{notFound ? t("notFound.body") : t("error.body")}</p>
      {!notFound ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t("refresh")}
        </Button>
      ) : null}
    </section>
  );
}

function TrackDetails({
  data,
  locale,
  dateTime,
  refreshing,
  onRefresh,
}: {
  data: PublicTracking;
  locale: string;
  dateTime: Intl.DateTimeFormat;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { t } = useTranslation("tracking");
  const companyLogo = resolvePublicMediaUrl(data.company?.logoUrl);
  const carrierName = data.carrier ? (locale === "ar" ? data.carrier.nameAr : data.carrier.nameEn) : null;

  const copyTrackingNumber = async () => {
    if (!data.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(data.trackingNumber);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <>
      {data.company ? (
        <header className="flex items-center gap-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-lg border bg-card object-contain p-1"
            />
          ) : null}
          <p className="text-sm text-muted-foreground">
            {t("orderFrom")} <span className="font-medium text-foreground">{data.company.name}</span>
          </p>
        </header>
      ) : null}

      <section className="space-y-5 rounded-xl border bg-card p-5" aria-labelledby="track-status">
        <h1 id="track-status" className={cn("text-xl font-semibold", TONE_CLASSES[statusTone(data.status)])}>
          {t(statusLabelKey(data.status))}
        </h1>

        <ol className="space-y-4" aria-label={t("progressLabel")}>
          {data.steps.map((step, index) => {
            const reached = step.at !== null;
            return (
              <li key={`${step.step}-${index}`} className="flex items-start gap-3">
                {reached ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium", !reached && "text-muted-foreground")}>
                    {t(stepLabelKey(step.step, data.kind))}
                    <span className="sr-only"> — {reached ? t("stepDone") : t("stepPending")}</span>
                  </p>
                  {step.at ? (
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={step.at}>{dateTime.format(new Date(step.at))}</time>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {data.hasIssue ? (
          <div
            role="status"
            className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <p>{t("issue")}</p>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5" aria-label={t("detailsLabel")}>
        {data.carrier && carrierName ? (
          <div className="flex items-center gap-3">
            <CarrierMark code="" name={carrierName} logoUrl={data.carrier.logoUrl} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("carrier")}</p>
              <p className="font-medium">{carrierName}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("trackingNumber")}</p>
            <p className="font-mono text-base" dir="ltr">
              {data.trackingNumber ?? t("trackingNumberPending")}
            </p>
          </div>
          {data.trackingNumber ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void copyTrackingNumber()}>
              <Copy data-icon="inline-start" />
              {t("copy")}
            </Button>
          ) : null}
        </div>

        {data.attempts > 0 ? (
          <p className="text-sm">{t("attempts", { count: data.attempts })}</p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-xs text-muted-foreground">
            {data.lastUpdateAt ? (
              <>
                {t("lastUpdate")} <time dateTime={data.lastUpdateAt}>{dateTime.format(new Date(data.lastUpdateAt))}</time>
              </>
            ) : (
              t("noUpdateYet")
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
