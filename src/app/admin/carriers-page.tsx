import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminCarriersHome } from "@/features/admin/carriers/components/carriers-home";

export function AdminCarriersPage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("carriers.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("carriers.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return <AdminCarriersHome />;
}
