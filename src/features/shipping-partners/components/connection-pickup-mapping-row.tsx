import { useTranslation } from "react-i18next";
import {
  mappingOffAccount,
  PICKUP_MAPPING_DEFAULT,
  type PickupMappingDraftValue,
} from "@/features/shipping-partners/lib/pickup-mapping-draft";
import type {
  ConnectionPickupLocationsResponse,
  PickupLocation,
} from "@/features/shipping-partners/types";
import type { SenderLocation } from "@/features/locations/types";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { SenderLocationStatus } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";

interface ConnectionPickupMappingRowProps {
  senderLocation: SenderLocation;
  pickupLocationId: PickupMappingDraftValue;
  locations: PickupLocation[];
  defaultLabel: string;
  pickupData: ConnectionPickupLocationsResponse | undefined;
  selectId: string;
  errorMessage: string | null;
  disabled: boolean;
  onChange: (value: PickupMappingDraftValue) => void;
}

function senderGovernorateLabel(
  location: SenderLocation,
  locale: string,
): string {
  if (locale === "ar") {
    return location.governorateNameAr ?? location.governorateNameEn ?? "—";
  }
  return location.governorateNameEn ?? location.governorateNameAr ?? "—";
}

export function ConnectionPickupMappingRow({
  senderLocation,
  pickupLocationId,
  locations,
  defaultLabel,
  pickupData,
  selectId,
  errorMessage,
  disabled,
  onChange,
}: ConnectionPickupMappingRowProps) {
  const { t } = useTranslation("shippingPartners");
  const locale = useLocaleStore((state) => state.locale);
  const offAccount = mappingOffAccount(senderLocation.id, pickupData);
  const errorId = errorMessage ? `${selectId}-error` : undefined;
  const warnId = offAccount ? `${selectId}-warn` : undefined;
  const describedBy = [errorId, warnId].filter(Boolean).join(" ") || undefined;

  return (
    <li className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-3">
        <div className="min-w-0 flex-1 sm:pt-1.5">
          <p className="text-sm font-medium leading-snug text-foreground">
            {senderLocation.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {senderGovernorateLabel(senderLocation, locale)}
            {senderLocation.status === SenderLocationStatus.INACTIVE
              ? ` · ${t("pickupMappings.inactiveSender")}`
              : null}
          </p>
        </div>

        <div className="w-full shrink-0 sm:w-[13.5rem]">
          <Label htmlFor={selectId} className="mb-1.5 block text-xs text-muted-foreground sm:sr-only">
            {t("pickupMappings.pickupFor", { name: senderLocation.name })}
          </Label>
          <Select
            value={pickupLocationId}
            onValueChange={(value) =>
              onChange(value as PickupMappingDraftValue)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id={selectId}
              className="h-9 w-full"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={describedBy}
            >
              <SelectValue placeholder={defaultLabel} />
            </SelectTrigger>
            <SelectContent align="end" className="max-w-[min(100vw-2rem,20rem)]">
              <SelectItem value={PICKUP_MAPPING_DEFAULT}>
                {defaultLabel}
              </SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <span className="block truncate">{location.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {errorMessage ? (
        <p id={errorId} className="mt-2 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {offAccount ? (
        <p
          id={warnId}
          className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400"
          role="status"
        >
          {t("pickupMappings.offAccountWarning")}
        </p>
      ) : null}
    </li>
  );
}
