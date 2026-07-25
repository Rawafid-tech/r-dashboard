import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CompaniesHome } from "@/features/admin/companies/components/companies-home";

export function AdminCompaniesPage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("companies.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("companies.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return <CompaniesHome />;
}
