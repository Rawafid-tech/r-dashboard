import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { ShipmentDetailHome } from "@/features/shipments/components/shipment-detail-home";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ShipmentDetailPage() {
  const { t } = useTranslation("shipments");
  const { shipmentId } = useParams<{ shipmentId: string }>();

  const title = shipmentId
    ? t("detail.metaTitle", { id: shipmentId.slice(0, 8) })
    : t("metaTitle");

  useDocumentMeta(title, t("detail.metaDescription"));

  return (
    <PermissionGate permission={MerchantPermission.SHIPMENT_READ}>
      <ShipmentDetailHome />
    </PermissionGate>
  );
}
