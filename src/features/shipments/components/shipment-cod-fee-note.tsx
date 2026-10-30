import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

interface ShipmentCodFeeNoteProps {
  carrierName: string;
  className?: string;
}

/**
 * Tells the merchant the partner adds its delivery fee to what the customer
 * pays. Render it right after the amount, so screen readers read them together.
 */
export function ShipmentCodFeeNote({
  carrierName,
  className,
}: ShipmentCodFeeNoteProps) {
  const { t } = useTranslation("shipments");

  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-pretty text-xs font-normal leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{t("booking.carrierCodFeeNote", { carrier: carrierName })}</span>
    </p>
  );
}
