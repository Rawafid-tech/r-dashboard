import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-background text-base shadow-xs transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      inputSize: {
        sm: "h-8 px-2.5 py-1 text-sm file:h-5 file:text-xs",
        default: "h-9 px-3 py-1 file:h-6 file:text-sm",
        lg: "h-10 px-3.5 py-2 text-base file:h-7 file:text-sm md:text-base",
        xl: "h-11 px-4 py-2.5 text-base file:h-8 file:text-sm md:text-base",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  },
);

function Input({
  className,
  type,
  inputSize,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={inputSize ?? "default"}
      className={cn(inputVariants({ inputSize, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
