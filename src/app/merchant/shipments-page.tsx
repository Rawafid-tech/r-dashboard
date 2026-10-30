import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ShipmentsHome } from "@/features/shipments";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ShipmentsPage() {
  const { t } = useTranslation("shipments");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ShipmentsHome />
    </PermissionGate>
  );
}
