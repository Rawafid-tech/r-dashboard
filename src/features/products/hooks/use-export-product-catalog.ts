import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useImportTemplate } from "@/features/products/hooks/use-import-template";
import { downloadProductCatalog } from "@/features/products/lib/import-catalog-xlsx";
import { useLocaleStore } from "@/stores/locale.store";

export function useExportProductCatalog() {
  const { t } = useTranslation("products");
  const locale = useLocaleStore((state) => state.locale);
  const templateQuery = useImportTemplate();
  const [isExporting, setIsExporting] = useState(false);

  const exportCatalog = useCallback(async () => {
    const columns = templateQuery.data;
    if (!columns?.length) return;

    setIsExporting(true);
    try {
      const count = await downloadProductCatalog(
        columns,
        locale === "ar" ? "كتالوج-المنتجات.xlsx" : "product-catalog.xlsx",
        locale,
      );
      toast.success(t("import.template.exportCatalogSuccess", { count }));
    } catch {
      toast.error(t("import.template.exportCatalogFailed"));
    } finally {
      setIsExporting(false);
    }
  }, [locale, t, templateQuery.data]);

  return {
    exportCatalog,
    isExporting,
    isReady: Boolean(templateQuery.data?.length),
  };
}
