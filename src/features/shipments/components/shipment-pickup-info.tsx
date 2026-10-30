import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPickupLocationLabel } from "@/features/shipments/lib/pickup-label";
import type {
  ShipmentPreviewPickup,
  ShipmentProblemCode,
} from "@/features/shipments/types";
import { connectionPickupSettingsPath } from "@/features/shipping-partners/lib/pickup-settings-link";

interface ShipmentPickupInfoProps {
  pickup: ShipmentPreviewPickup;
  connectionId: string | undefined;
  showDefaultWarning: boolean;
  className?: string;
}

export function ShipmentPickupInfo({
  pickup,
  connectionId,
  showDefaultWarning,
  className,
}: ShipmentPickupInfoProps) {
  const { t } = useTranslation("shipments");
  const label = formatPickupLocationLabel(
    pickup,
    t("booking.senderLocationFallback"),
  );
  const settingsPath =
    connectionId != null ? connectionPickupSettingsPath(connectionId) : null;

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">
        {t("booking.collectedFrom", { name: label })}
      </p>
      {pickup.source === "DEFAULT" && showDefaultWarning && settingsPath ? (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          {t("booking.defaultPickupWarning")}{" "}
          <Link
            to={settingsPath}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("booking.openPickupMappings")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

const PROBLEM_LINK_CLASS =
  "font-medium text-primary underline-offset-4 hover:underline";

interface ShipmentProblemActionProps {
  code: ShipmentProblemCode;
  connectionId: string | undefined;
  className?: string;
}

/** The follow-up link for a preview problem, when the fix lives on another screen. */
export function ShipmentProblemAction({
  code,
  connectionId,
  className = PROBLEM_LINK_CLASS,
}: ShipmentProblemActionProps) {
  const { t } = useTranslation("shipments");

  if (code === "PICKUP_LOCATION" && connectionId) {
    return (
      <Link to={connectionPickupSettingsPath(connectionId)} className={className}>
        {t("booking.openPickupMappings")}
      </Link>
    );
  }

  if (code === "SENDER_AREA") {
    return (
      <Link to="/locations" className={className}>
        {t("booking.openSenderLocations")}
      </Link>
    );
  }

  return null;
}
