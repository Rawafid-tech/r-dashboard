import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { Carrier } from "@/features/shipping-partners/types";
import { Button } from "@/shared/components/ui";

interface CarrierCatalogProps {
  carriers: Carrier[];
  canManage: boolean;
  onConnect: (carrier: Carrier, opener: HTMLElement) => void;
}

export function CarrierCatalog({
  carriers,
  canManage,
  onConnect,
}: CarrierCatalogProps) {
  const { t, i18n } = useTranslation("shippingPartners");

  if (carriers.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center"
        role="status"
      >
        <span
          className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden="true"
        >
          <Truck className="size-5" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {t("catalog.emptyTitle")}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("catalog.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {carriers.map((carrier) => {
        const name = carrierDisplayName(carrier, i18n.language);
        return (
          <li key={carrier.code}>
            <article className="flex h-full flex-col rounded-xl border border-border/70 bg-card shadow-xs">
              <div className="flex items-center gap-3 p-4">
                <CarrierMark
                  code={carrier.code}
                  name={name}
                  className="size-12 shrink-0 text-sm"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {name}
                  </h2>
                  <p
                    className="mt-0.5 w-fit font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
                    dir="ltr"
                  >
                    {carrier.code}
                  </p>
                </div>
              </div>
              {canManage ? (
                <div className="mt-auto border-t border-border/60 p-3">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={(event) => onConnect(carrier, event.currentTarget)}
                  >
                    {t("catalog.connect")}
                  </Button>
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
