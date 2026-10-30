import { AlertTriangle, CircleX } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { Shipment } from "@/features/shipments/types";

/** The booking's answer was lost; the parcel may still exist at the carrier. */
const NOT_CONFIRMED_FAILURE = "shipment.notConfirmed";

interface ShipmentFailureBannerProps {
  shipment: Shipment;
}

export function ShipmentFailureBanner({ shipment }: ShipmentFailureBannerProps) {
  const { t } = useTranslation("shipments");
  const headingId = useId();
  const failure = shipment.failure;

  if (shipment.status !== "FAILED" || !failure) return null;

  if (failure.code === NOT_CONFIRMED_FAILURE) {
    return (
      <section
        role="alert"
        aria-labelledby={headingId}
        className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-4"
      >
        <AlertTriangle
          className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1">
          <h2 id={headingId} className="font-semibold text-foreground">
            {t("detail.failure.notConfirmedTitle")}
          </h2>
          <p className="text-sm text-foreground">{failure.message}</p>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {t("detail.failure.notConfirmedHint")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
    >
      <CircleX
        className="mt-0.5 size-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <h2 id={headingId} className="text-sm font-semibold text-destructive">
          {t("detail.failure.title")}
        </h2>
        <p className="text-sm text-muted-foreground">{failure.message}</p>
      </div>
    </section>
  );
}
