import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CarrierRegionsHome } from "@/features/admin/carriers/components/regions-home";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

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

  useDocumentMeta(t("carriers.regions.metaTitle", { name }), t("carriers.regions.metaDescription", { name }));

  return <CarrierRegionsHome key={code} />;
}
