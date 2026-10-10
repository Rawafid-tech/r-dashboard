import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ShipmentDetailHome } from "@/features/shipments/components/shipment-detail-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";

export function ShipmentDetailPage() {
  const { t } = useTranslation("shipments");
  const { shipmentId } = useParams<{ shipmentId: string }>();

  useEffect(() => {
    const previousTitle = document.title;
    const title = shipmentId
      ? t("detail.metaTitle", { id: shipmentId.slice(0, 8) })
      : t("metaTitle");
    document.title = title;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("detail.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t, shipmentId]);

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ShipmentDetailHome />
    </PermissionGate>
  );
}
