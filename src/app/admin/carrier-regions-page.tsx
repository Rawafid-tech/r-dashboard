import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CarrierRegionsHome } from "@/features/admin/carriers/components/regions-home";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";

export function AdminCarrierRegionsPage() {
  const { code = "" } = useParams();
  const { t, i18n } = useTranslation("admin");
  const carriersQuery = useAdminCarriers();
  const carrier = carriersQuery.data?.find((item) => item.code === code);
  const name = carrier
    ? carrierDisplayName(
        {
          code: carrier.code,
          nameEn: carrier.nameEn ?? "",
          nameAr: carrier.nameAr ?? "",
        },
        i18n.language,
      )
    : code || t("carriers.regions.hero.titleFallback");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("carriers.regions.metaTitle", { name });

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("carriers.regions.metaDescription", { name });

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [name, t]);

  return <CarrierRegionsHome key={code} />;
}
