import { Minus, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface ReturnItemQuantityStepperProps {
  id: string;
  label: string;
  value: number;
  max: number;
  disabled?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}

export function ReturnItemQuantityStepper({
  id,
  label,
  value,
  max,
  disabled,
  decreaseLabel,
  increaseLabel,
  onChange,
}: ReturnItemQuantityStepperProps) {
  const adjust = (delta: number) => {
    onChange(Math.min(max, Math.max(0, value + delta)));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
      </div>
      <div
        className="flex items-center gap-1"
        role="group"
        aria-labelledby={`${id}-label`}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={disabled || value <= 0}
          aria-label={decreaseLabel}
          onClick={() => adjust(-1)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <span
          id={id}
          className="min-w-[2.5rem] text-center text-sm font-medium tabular-nums"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          role="spinbutton"
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={disabled || value >= max}
          aria-label={increaseLabel}
          onClick={() => adjust(1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
