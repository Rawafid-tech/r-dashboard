import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { BillingHome } from "@/features/subscription/components/billing-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function BillingPage() {
  const { t } = useTranslation("billing");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SUBSCRIPTION_READ}>
      <BillingHome />
    </PermissionGate>
  );
}
