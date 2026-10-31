import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { LocationsHome } from "@/features/locations";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function LocationsPage() {
  const { t } = useTranslation("locations");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SENDER_LOCATION_READ}>
      <LocationsHome />
    </PermissionGate>
  );
}
