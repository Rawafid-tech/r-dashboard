import type { FieldError, FieldErrors } from "react-hook-form";
import { FieldError as FieldErrorDisplay } from "@/shared/components/ui";
import type { PlanFormValues } from "@/features/admin/plans/schema";

type ArrayFieldRoot = "tiers" | "features";

export function getIndexedFieldError(
  errors: FieldErrors<PlanFormValues>,
  root: ArrayFieldRoot,
  index: number,
  field: string,
): FieldError | undefined {
  const rootErrors = errors[root];
  if (!Array.isArray(rootErrors)) return undefined;

  const item = rootErrors[index] as Record<string, FieldError> | undefined;
  return item?.[field];
}

export function getArrayRootError(
  errors: FieldErrors<PlanFormValues>,
  root: ArrayFieldRoot,
): string | undefined {
  const rootErrors = errors[root];
  if (!rootErrors) return undefined;

  if (!Array.isArray(rootErrors)) {
    if ("message" in rootErrors && typeof rootErrors.message === "string") {
      return rootErrors.message;
    }

    if (
      "root" in rootErrors &&
      rootErrors.root &&
      typeof rootErrors.root.message === "string"
    ) {
      return rootErrors.root.message;
    }
  }

  return undefined;
}

interface PlanIndexedFieldErrorProps {
  errors: FieldErrors<PlanFormValues>;
  root: ArrayFieldRoot;
  index: number;
  field: string;
}

export function PlanIndexedFieldError({
  errors,
  root,
  index,
  field,
}: PlanIndexedFieldErrorProps) {
  const error = getIndexedFieldError(errors, root, index, field);
  return <FieldErrorDisplay errors={error ? [error] : undefined} />;
}

interface PlanArrayRootErrorProps {
  errors: FieldErrors<PlanFormValues>;
  root: ArrayFieldRoot;
}

export function PlanArrayRootError({ errors, root }: PlanArrayRootErrorProps) {
  const message = getArrayRootError(errors, root);
  if (!message) return null;
  return <FieldErrorDisplay errors={[{ message }]} />;
}
