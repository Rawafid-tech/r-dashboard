import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ShippingPartnersHome } from "@/features/shipping-partners";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ShippingPartnersPage() {
  const { t } = useTranslation("shippingPartners");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.CARRIER_CONNECTION_READ}>
      <ShippingPartnersHome />
    </PermissionGate>
  );
}
