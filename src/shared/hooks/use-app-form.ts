import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

type UseAppFormProps<TSchema extends z.ZodTypeAny> = Omit<
  UseFormProps<z.infer<TSchema>>,
  "resolver"
> & {
  schema: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
};

/**
 * Project standard: React Hook Form + Zod resolver.
 * Use in feature forms instead of wiring zodResolver manually.
 */
export function useAppForm<TSchema extends z.ZodTypeAny>({
  schema,
  ...formProps
}: UseAppFormProps<TSchema>): UseFormReturn<z.infer<TSchema> & FieldValues> {
  return useForm({
    ...formProps,
    // @hookform/resolvers expects the concrete Zod schema instance
    resolver: zodResolver(schema),
  });
}
