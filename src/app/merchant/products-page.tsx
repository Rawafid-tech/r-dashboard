import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ProductsHome } from "@/features/products";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ProductsPage() {
  const { t } = useTranslation("products");
  const [searchParams] = useSearchParams();
  const isImportTab = searchParams.get("tab") === "import";

  useDocumentMeta(isImportTab ? t("import.metaTitle") : t("metaTitle"), isImportTab
      ? t("import.metaDescription")
      : t("metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.PRODUCT_READ}>
      <ProductsHome />
    </PermissionGate>
  );
}
