import { useMemo, useState, type ComponentProps, type MouseEvent } from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { arEG as arEGFns, enUS as enUSFns } from "date-fns/locale";
import { arEG, enUS } from "react-day-picker/locale";
import type { Matcher } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useLocaleStore } from "@/stores/locale.store";

/** Parse `YYYY-MM-DD` as a local calendar date (avoids UTC shift). */
export function parseISODate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

/** Format a local Date as `YYYY-MM-DD` for API / form values. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Extra classes for the trigger button */
  triggerClassName?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  /** Shown month when no value is selected */
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  disabledDates?: Matcher | Matcher[];
  captionLayout?: ComponentProps<typeof Calendar>["captionLayout"];
  /** Allow clearing the selected date */
  clearable?: boolean;
  /** Display format using date-fns tokens */
  displayFormat?: string;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  id,
  name,
  placeholder,
  disabled = false,
  className,
  triggerClassName,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  defaultMonth,
  startMonth,
  endMonth,
  disabledDates,
  captionLayout = "dropdown",
  clearable = true,
  displayFormat,
}: DatePickerProps) {
  const { t } = useTranslation("common");
  const locale = useLocaleStore((state) => state.locale);
  const dir = useLocaleStore((state) => state.dir);
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => parseISODate(value), [value]);
  const dayPickerLocale = locale === "ar" ? arEG : enUS;
  const formatLocale = locale === "ar" ? arEGFns : enUSFns;
  const resolvedFormat =
    displayFormat ?? (locale === "ar" ? "d MMMM yyyy" : "MMM d, yyyy");

  const resolvedPlaceholder = placeholder ?? t("datePicker.placeholder");

  function handleSelect(date: Date | undefined) {
    onChange?.(date ? toISODate(date) : "");
    if (date) setOpen(false);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onChange?.("");
  }

  return (
    <div className={cn("relative w-full", className)}>
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} readOnly />
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel ?? resolvedPlaceholder}
            aria-expanded={open}
            aria-haspopup="dialog"
            data-empty={!selected || undefined}
            onBlur={onBlur}
            className={cn(
              "h-9 w-full justify-start gap-2 pe-9 ps-3 font-normal text-start",
              "data-[empty=true]:text-muted-foreground",
              "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
              "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              clearable && selected && "pe-9",
              triggerClassName,
            )}
          >
            <CalendarIcon
              data-icon="inline-start"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="flex-1 truncate">
              {selected
                ? format(selected, resolvedFormat, { locale: formatLocale })
                : resolvedPlaceholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto p-0"
          dir={dir}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? defaultMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={disabledDates}
            captionLayout={captionLayout}
            locale={dayPickerLocale}
            dir={dir}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {clearable && selected && !disabled ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute end-1.5 top-1/2 -translate-y-1/2"
          aria-label={t("datePicker.clear")}
          onClick={handleClear}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
