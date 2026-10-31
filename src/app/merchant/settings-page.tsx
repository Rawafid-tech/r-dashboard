import { useTranslation } from "react-i18next";
import { SettingsHome } from "@/features/account/components/settings-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function SettingsPage() {
  const { t } = useTranslation("settings");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return <SettingsHome />;
}
