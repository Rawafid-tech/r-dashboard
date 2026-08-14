import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { RolesHome } from "@/features/roles";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";

export function RolesPage() {
  const { t } = useTranslation("roles");

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

  return (
    <PermissionGate permission={MerchantPermission.ROLE_READ}>
      <RolesHome />
    </PermissionGate>
  );
}
