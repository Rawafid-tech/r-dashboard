import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ProductsHome } from "@/features/products";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";

export function ProductsPage() {
  const { t } = useTranslation("products");
  const [searchParams] = useSearchParams();
  const isImportTab = searchParams.get("tab") === "import";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = isImportTab ? t("import.metaTitle") : t("metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = isImportTab
      ? t("import.metaDescription")
      : t("metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [isImportTab, t]);

  return (
    <PermissionGate permission={MerchantPermission.PRODUCT_READ}>
      <ProductsHome />
    </PermissionGate>
  );
}
