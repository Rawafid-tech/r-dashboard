import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ReturnsHome } from "@/features/returns/components/returns-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";

export function ReturnsPage() {
  const { t } = useTranslation("returns");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("list.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("list.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ReturnsHome />
    </PermissionGate>
  );
}
