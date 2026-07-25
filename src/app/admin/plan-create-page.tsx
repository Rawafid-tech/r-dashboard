import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PlanCreateHome } from "@/features/admin/plans/components/plan-create-home";

export function AdminPlanCreatePage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("plans.create.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("plans.create.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return <PlanCreateHome />;
}
