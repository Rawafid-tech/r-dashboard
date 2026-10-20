import { ArrowLeft, MapPinned, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { RegionResolveDialog } from "@/features/admin/carriers/components/region-resolve-dialog";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { Button } from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface RegionsHeroProps {
  name: string;
  code: string;
  logoUrl?: string | null;
  canManage: boolean;
  isSyncing: boolean;
  totalElements?: number;
  onSync: () => void;
}

export function RegionsHero({
  name,
  code,
  logoUrl,
  canManage,
  isSyncing,
  totalElements,
  onSync,
}: RegionsHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ms-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <Link to="/admin/carriers">
          <ArrowLeft aria-hidden="true" />
          {t("carriers.regions.back")}
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <CarrierMark code={code} name={name} logoUrl={logoUrl} />
            <span className="min-w-0">{t("carriers.regions.hero.title", { name })}</span>
          </span>
        }
        description={
          <span className="block space-y-1">
            <span className="block">{t("carriers.regions.hero.subtitle")}</span>
            <span id="carrier-regions-sync-hint" className="block">
              {canManage
                ? t("carriers.regions.sync.hint")
                : t("carriers.regions.sync.readOnly")}
            </span>
          </span>
        }
        actions={
          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:items-end">
            {typeof totalElements === "number" ? (
              <PageStat
                label={t("carriers.regions.hero.totalLabel")}
                value={totalElements.toLocaleString(intlLocale)}
                className="w-full sm:w-auto"
              />
            ) : null}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:min-w-[20rem]">
              <Button
                type="button"
                onClick={onSync}
                disabled={!canManage || isSyncing}
                aria-busy={isSyncing}
                aria-describedby="carrier-regions-sync-hint"
                className="w-full"
              >
                <RefreshCw
                  className={isSyncing ? "animate-spin" : undefined}
                  aria-hidden="true"
                />
                {isSyncing
                  ? t("carriers.regions.sync.pending")
                  : t("carriers.regions.sync.action")}
              </Button>
              <RegionResolveDialog
                carrierCode={code}
                trigger={
                  <Button type="button" variant="outline" className="w-full">
                    <MapPinned aria-hidden="true" />
                    {t("carriers.regions.resolve.open")}
                  </Button>
                }
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
