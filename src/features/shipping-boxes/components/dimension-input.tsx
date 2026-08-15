import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { Button, Input } from "@/shared/components/ui";
import { roundDimensionInput } from "@/features/shipping-boxes/lib/format-dimension";

const STEP = 0.01;
const MIN = 0.01;
const MAX = 999.99;

interface DimensionInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  unitLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
}

export function DimensionInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  unitLabel,
  decreaseLabel,
  increaseLabel,
}: DimensionInputProps) {
  const unitId = useId();

  const adjust = (delta: number) => {
    const parsed = Number(value);
    const base = Number.isFinite(parsed) ? parsed : 0;
    const next = Math.min(MAX, Math.max(MIN, base + delta));
    onChange(String(Math.round(next * 100) / 100));
  };

  const handleBlur = () => {
    onChange(roundDimensionInput(value));
    onBlur?.();
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-stretch gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          disabled={disabled}
          aria-label={decreaseLabel}
          onClick={() => adjust(-STEP)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <div className="flex min-w-0 flex-1 items-stretch gap-1.5">
          <Input
            id={id}
            inputMode="decimal"
            dir="ltr"
            value={value ?? ""}
            disabled={disabled}
            autoComplete="off"
            aria-invalid={invalid || undefined}
            aria-describedby={unitId}
            className="min-w-0 flex-1 text-start tabular-nums"
            onChange={(event) => onChange(event.target.value)}
            onBlur={handleBlur}
          />
          <span
            id={unitId}
            className="flex shrink-0 items-center text-xs text-muted-foreground"
          >
            {unitLabel}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          disabled={disabled}
          aria-label={increaseLabel}
          onClick={() => adjust(STEP)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
