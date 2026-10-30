import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ShippingBoxesHome } from "@/features/shipping-boxes";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ShippingBoxesPage() {
  const { t } = useTranslation("shippingBoxes");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SHIPPING_BOX_READ}>
      <ShippingBoxesHome />
    </PermissionGate>
  );
}
