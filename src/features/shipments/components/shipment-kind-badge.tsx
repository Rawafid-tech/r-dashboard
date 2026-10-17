import { useTranslation } from "react-i18next";
import { isExchange, isReturnPickup } from "@/features/shipments/lib/shipment-kind";
import type { Shipment } from "@/features/shipments/types";
import { Badge } from "@/shared/components/ui";

interface ShipmentKindBadgeProps {
  shipment: Pick<Shipment, "kind">;
}

export function ShipmentKindBadge({ shipment }: ShipmentKindBadgeProps) {
  const { t } = useTranslation("shipments");

  if (isReturnPickup(shipment)) {
    return (
      <Badge variant="outline" className="font-normal">
        {t("kind.return")}
      </Badge>
    );
  }

  if (isExchange(shipment)) {
    return (
      <Badge variant="outline" className="font-normal">
        {t("kind.exchange")}
      </Badge>
    );
  }

  return null;
}
