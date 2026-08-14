import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  FieldDescription,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui";
import {
  useAreaSearch,
  useGovernorateAreas,
} from "@/features/locations/hooks/use-governorate-areas";
import {
  getGeoAreaLabel,
} from "@/features/locations/lib/location-form-errors";
import type { GeoArea } from "@/features/locations/types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

interface AreaComboboxFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  governorateId: string;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
  hint?: string;
}

function filterAreasLocally(
  areas: GeoArea[],
  term: string,
  locale: "ar" | "en",
): GeoArea[] {
  const normalized = term.trim();
  if (!normalized) return areas.slice(0, 50);

  return areas
    .filter((area) =>
      getGeoAreaLabel(area, locale).includes(normalized),
    )
    .slice(0, 50);
}

export function AreaComboboxField({
  id,
  value,
  onChange,
  governorateId,
  disabled,
  invalid,
  label,
  hint,
}: AreaComboboxFieldProps) {
  const { t } = useTranslation("locations");
  const locale = useLocaleStore((state) => state.locale);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasGovernorate = governorateId.trim().length > 0;
  const areasQuery = useGovernorateAreas(governorateId, {
    enabled: hasGovernorate,
  });
  const debouncedTerm = useDebounce(value.trim(), 300);

  const localMatches = useMemo(() => {
    if (!areasQuery.data) return [];
    return filterAreasLocally(areasQuery.data, value, locale);
  }, [areasQuery.data, value, locale]);

  const shouldUseRemoteSearch =
    hasGovernorate &&
    debouncedTerm.length > 0 &&
    localMatches.length === 0;

  const remoteSearchQuery = useAreaSearch(governorateId, debouncedTerm, {
    enabled: shouldUseRemoteSearch,
  });

  const suggestions = useMemo(() => {
    if (!hasGovernorate) return [];
    if (shouldUseRemoteSearch) return remoteSearchQuery.data ?? [];
    return localMatches;
  }, [
    hasGovernorate,
    shouldUseRemoteSearch,
    remoteSearchQuery.data,
    localMatches,
  ]);

  const isLoading =
    areasQuery.isLoading ||
    (shouldUseRemoteSearch && remoteSearchQuery.isFetching);

  const activeDescendantId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, governorateId, suggestions.length]);

  const selectSuggestion = useCallback(
    (area: GeoArea) => {
      onChange(area.nameAr);
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onChange],
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
      selectSuggestion(suggestions[activeIndex]!);
    }
  };

  const showList =
    open &&
    hasGovernorate &&
    (isLoading || suggestions.length > 0 || value.trim().length > 0);

  const resultsCount = suggestions.length;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint ? <FieldDescription className="m-0">{hint}</FieldDescription> : null}

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
              aria-label={label}
              value={value}
              disabled={disabled || !hasGovernorate}
              placeholder={
                hasGovernorate
                  ? t("form.areaPlaceholder")
                  : t("form.areaGovernorateRequired")
              }
              autoComplete="off"
              onChange={(event) => {
                onChange(event.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => {
                if (hasGovernorate) setOpen(true);
              }}
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
            aria-label={t("form.areaSuggestionsLabel")}
            className="max-h-60 overflow-y-auto py-1"
          >
            {isLoading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                {t("form.areaLoading")}
              </p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                {t("form.areaNoSuggestions")}
              </p>
            ) : (
              suggestions.map((area, index) => {
                const optionId = `${listboxId}-option-${index}`;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={area.id}
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
                    onClick={() => selectSuggestion(area)}
                  >
                    {getGeoAreaLabel(area, locale)}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {open && !isLoading && resultsCount > 0
          ? t("form.areaResultsCount", { count: resultsCount })
          : ""}
      </p>

      {!hasGovernorate ? (
        <p className="text-xs text-muted-foreground">
          {t("form.areaGovernorateRequired")}
        </p>
      ) : null}

      {areasQuery.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {t("form.areasLoadFailed")}
        </p>
      ) : null}
    </div>
  );
}
