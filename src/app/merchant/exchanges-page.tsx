import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ExchangesHome } from "@/features/exchanges/components/exchanges-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ExchangesPage() {
  const { t } = useTranslation("exchanges");

  useDocumentMeta(t("list.metaTitle"), t("list.metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ExchangesHome />
    </PermissionGate>
  );
}
