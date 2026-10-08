import { useTranslation } from "react-i18next";
import type { CarrierRegionsSyncResult } from "@/features/admin/carriers/types";
import { unmappedCityLabel } from "@/features/admin/carriers/lib/region-label";
import { Badge, Button } from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface RegionsSyncSummaryProps {
  result: CarrierRegionsSyncResult;
  onShowUnmapped: () => void;
}

export function RegionsSyncSummary({
  result,
  onShowUnmapped,
}: RegionsSyncSummaryProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formatCount = (value: number) => value.toLocaleString(intlLocale);
  const unmappedLabels = result.unmappedCities
    .map((city) => unmappedCityLabel(city, locale))
    .filter((label) => label.length > 0);
  const hasUnmapped = result.unmappedCities.length > 0;

  return (
    <div className="space-y-3">
      <p
        role="status"
        className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground"
      >
        {t("carriers.regions.sync.summary", {
          added: formatCount(result.added),
          updated: formatCount(result.updated),
          retired: formatCount(result.retired),
          total: formatCount(result.total),
        })}
      </p>

      {hasUnmapped ? (
        <div
          role="alert"
          className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-4"
        >
          <p className="font-medium text-foreground">
            {t("carriers.regions.sync.unmappedTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("carriers.regions.sync.unmappedHint", {
              count: formatCount(result.unmappedCities.length),
            })}
          </p>
          {unmappedLabels.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {unmappedLabels.map((label, index) => (
                <li key={`${label}-${index}`}>
                  <Badge variant="warning">{label}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onShowUnmapped}
          >
            {t("carriers.regions.sync.showUnmapped")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
