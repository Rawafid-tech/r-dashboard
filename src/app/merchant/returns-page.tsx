import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ReturnsHome } from "@/features/returns/components/returns-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ReturnsPage() {
  const { t } = useTranslation("returns");

  useDocumentMeta(t("list.metaTitle"), t("list.metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ReturnsHome />
    </PermissionGate>
  );
}
