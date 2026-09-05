import { useQuery } from "@tanstack/react-query";
import { getImportTemplate } from "@/features/products/api/product-import.api";
import { productKeys } from "@/features/products/hooks/use-products";
import { useLocaleStore } from "@/stores/locale.store";

export const importTemplateKeys = {
  all: [...productKeys.all, "import-template"] as const,
  locale: (locale: string) => [...importTemplateKeys.all, locale] as const,
};

interface UseImportTemplateOptions {
  enabled?: boolean;
}

export function useImportTemplate(options: UseImportTemplateOptions = {}) {
  const locale = useLocaleStore((state) => state.locale);

  return useQuery({
    queryKey: importTemplateKeys.locale(locale),
    queryFn: getImportTemplate,
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
