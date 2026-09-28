import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import type { OrderStatus } from "@/features/orders/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation("orders");

  const variant =
    status === "PENDING" ? "warning" : status === "CANCELLED" ? "muted" : "muted";

  return (
    <Badge variant={variant}>
      {t(`status.${status}`)}
    </Badge>
  );
}
