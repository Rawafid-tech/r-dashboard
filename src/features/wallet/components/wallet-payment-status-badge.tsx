import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import type { PaymentStatus } from "@/features/wallet/types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  /**
   * Whether the money has been credited to the wallet.
   * Needed to distinguish `COMPLETED + credited:false` ("Settling")
   * from a true `COMPLETED + credited:true`.
   */
  credited: boolean;
}

/**
 * Renders a status badge according to the contract's state matrix:
 *
 * | status       | credited | variant     | label          |
 * |--------------|----------|-------------|----------------|
 * | PENDING      | false    | warning     | Waiting…       |
 * | COMPLETED    | true     | success     | Completed      |
 * | COMPLETED    | false    | warning     | Settling       |
 * | FAILED       | false    | destructive | Failed         |
 * | NEEDS_REVIEW | any      | muted       | Under review   |
 */
export function PaymentStatusBadge({
  status,
  credited,
}: PaymentStatusBadgeProps) {
  const { t } = useTranslation("wallet");

  type BadgeVariant =
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "muted";

  const resolveVariant = (): BadgeVariant => {
    if (status === "COMPLETED" && credited) return "success";
    if (status === "COMPLETED" && !credited) return "warning";
    if (status === "PENDING") return "warning";
    if (status === "FAILED") return "destructive";
    if (status === "NEEDS_REVIEW") return "muted";
    return "muted";
  };

  const resolveLabel = (): string => {
    if (status === "COMPLETED" && !credited) {
      return t("payments.creditedSettling");
    }
    return t(`payments.status_${status}` as Parameters<typeof t>[0], {
      defaultValue: status,
    });
  };

  return (
    <Badge variant={resolveVariant()} aria-label={resolveLabel()}>
      {resolveLabel()}
    </Badge>
  );
}
