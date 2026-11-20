import { useTranslation } from "react-i18next";
import type { ShipmentAddressMethod } from "@/features/shipments/types";

/** Unicode first-strong isolate: keeps an Arabic area readable in English text. */
const ISOLATE_START = "⁨";
const ISOLATE_END = "⁩";

interface DistrictMatchNoteProps {
  method: ShipmentAddressMethod | null | undefined;
  /** The area as the order spells it. */
  area: string | null | undefined;
}

/**
 * Says which typed area became the shown district when the carrier knows it
 * by another name (`ALIAS`), e.g. "روكسي" → مصر الجديدة.
 */
export function DistrictMatchNote({ method, area }: DistrictMatchNoteProps) {
  const { t } = useTranslation("shipments");
  const typed = area?.trim();
  if (method !== "ALIAS" || !typed) return null;

  return (
    <p className="mt-0.5 text-xs text-muted-foreground">
      {t("booking.aliasMatched", {
        area: `${ISOLATE_START}${typed}${ISOLATE_END}`,
      })}
    </p>
  );
}
