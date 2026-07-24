import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SettingsHome } from "@/features/account/components/settings-home";

export function SettingsPage() {
  const { t } = useTranslation("settings");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return <SettingsHome />;
}
