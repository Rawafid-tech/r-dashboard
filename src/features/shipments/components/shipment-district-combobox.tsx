import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useShipmentDistricts } from "@/features/shipments/hooks/use-shipment-districts";
import { getShipmentDistrictLabel } from "@/features/shipments/lib/district-label";
import type { ShipmentDistrict, ShipmentKind } from "@/features/shipments/types";
import {
  FieldDescription,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

interface ShipmentDistrictComboboxProps {
  id: string;
  connectionId: string;
  governorateId: string;
  selectedDistrict: ShipmentDistrict | null;
  onSelect: (district: ShipmentDistrict | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  kind?: ShipmentKind;
}

export function ShipmentDistrictCombobox({
  id,
  connectionId,
  governorateId,
  selectedDistrict,
  onSelect,
  disabled,
  invalid,
  kind,
}: ShipmentDistrictComboboxProps) {
  const { t } = useTranslation("shipments");
  const locale = useLocaleStore((state) => state.locale);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const districtsQuery = useShipmentDistricts(
    connectionId && governorateId && debouncedSearch
      ? {
          connectionId,
          governorateId,
          search: debouncedSearch,
          kind,
        }
      : null,
  );

  const suggestions = useMemo(
    () => districtsQuery.data ?? [],
    [districtsQuery.data],
  );

  const displayValue = open
    ? search
    : selectedDistrict
      ? getShipmentDistrictLabel(selectedDistrict, locale)
      : "";

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedSearch, suggestions.length]);

  const selectDistrict = useCallback(
    (district: ShipmentDistrict) => {
      onSelect(district);
      setSearch("");
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onSelect],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? -1
          : Math.min(current + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0 ? -1 : Math.max(current - 1, 0),
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      selectDistrict(suggestions[activeIndex]!);
    }
  };

  const showList =
    open && debouncedSearch.length > 0 && (districtsQuery.isFetching || suggestions.length > 0);

  const activeDescendantId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {t("booking.districtLabel")}
      </label>
      <FieldDescription className="m-0">{t("booking.districtHint")}</FieldDescription>

      <Popover open={showList} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              id={id}
              role="combobox"
              aria-expanded={showList}
              aria-controls={showList ? listboxId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendantId}
              aria-invalid={invalid || undefined}
              value={displayValue}
              disabled={disabled}
              placeholder={t("booking.districtPlaceholder")}
              autoComplete="off"
              onChange={(event) => {
                setSearch(event.target.value);
                if (selectedDistrict) {
                  onSelect(null);
                }
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={t("booking.districtLabel")}
            className="max-h-60 overflow-y-auto py-1"
          >
            {districtsQuery.isFetching ? (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                {t("common:common.loading")}
              </p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                {t("booking.districtPlaceholder")}
              </p>
            ) : (
              suggestions.map((district, index) => {
                const optionId = `${listboxId}-option-${index}`;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={district.id}
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex w-full px-3 py-2 text-start text-sm outline-none transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/70",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectDistrict(district)}
                  >
                    {getShipmentDistrictLabel(district, locale)}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {showList && !districtsQuery.isFetching && suggestions.length > 0
          ? String(suggestions.length)
          : ""}
      </p>
    </div>
  );
}
