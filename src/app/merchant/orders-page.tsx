import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { OrdersHome } from "@/features/orders";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function OrdersPage() {
  const { t } = useTranslation("orders");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.ORDER_READ}>
      <OrdersHome />
    </PermissionGate>
  );
}
