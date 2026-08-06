import { useEffect, useId, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  DatePicker,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { useCompanyUser } from "@/features/users/hooks/use-company-user";
import { useUpdateCompanyUser } from "@/features/users/hooks/use-update-company-user";
import {
  applyUserFieldErrors,
  toUpdateUserPayload,
} from "@/features/users/lib/user-form-errors";
import {
  createEditUserSchema,
  type EditUserFormValues,
} from "@/features/users/schema";
import type { CompanyUser } from "@/features/users/types";
import { useAppForm } from "@/shared/hooks/use-app-form";

const DOB_END = new Date();
DOB_END.setHours(0, 0, 0, 0);
const DOB_START = new Date(DOB_END.getFullYear() - 100, 0, 1);
const DOB_DEFAULT_MONTH = new Date(
  DOB_END.getFullYear() - 25,
  DOB_END.getMonth(),
  1,
);

interface UserEditDialogProps {
  user: CompanyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
}: UserEditDialogProps) {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const userId = user?.id ?? null;

  const userQuery = useCompanyUser(userId, {
    enabled: open && Boolean(userId),
  });
  const updateMutation = useUpdateCompanyUser(userId ?? "");

  const schema = useMemo(
    () => createEditUserSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) return;

    const source = userQuery.data ?? user;
    if (!source) return;

    reset({
      firstName: source.firstName,
      lastName: source.lastName,
      phone: source.phone,
      dateOfBirth: source.dateOfBirth ?? "",
    });
  }, [open, user, userQuery.data, reset]);

  const busy = isSubmitting || updateMutation.isPending;
  const isLoading = open && userQuery.isLoading && !userQuery.data;

  const onSubmit = handleSubmit(async (values: EditUserFormValues) => {
    if (!userId) return;

    try {
      await updateMutation.mutateAsync(toUpdateUserPayload(values));
      onOpenChange(false);
    } catch (error) {
      applyUserFieldErrors(error, setError);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w3"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("edit.title")}</DialogTitle>
          <DialogDescription>{t("edit.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div
            className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("edit.loading")}
          </div>
        ) : (
          <form id={formId} onSubmit={onSubmit} noValidate>
            <DialogBody className="space-y-3.5">
              <FieldGroup className="gap-3.5">
                <Field data-invalid={Boolean(errors.firstName) || undefined}>
                  <FieldLabel htmlFor={`${formId}-firstName`}>
                    {t("edit.firstName")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-firstName`}
                    disabled={busy}
                    {...register("firstName")}
                  />
                  {errors.firstName?.message ? (
                    <FieldError>{errors.firstName.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.lastName) || undefined}>
                  <FieldLabel htmlFor={`${formId}-lastName`}>
                    {t("edit.lastName")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-lastName`}
                    disabled={busy}
                    {...register("lastName")}
                  />
                  {errors.lastName?.message ? (
                    <FieldError>{errors.lastName.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.phone) || undefined}>
                  <FieldLabel htmlFor={`${formId}-phone`}>
                    {t("edit.phone")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-phone`}
                    type="tel"
                    dir="ltr"
                    disabled={busy}
                    {...register("phone")}
                  />
                  {errors.phone?.message ? (
                    <FieldError>{errors.phone.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.dateOfBirth) || undefined}>
                  <FieldLabel htmlFor={`${formId}-dob`}>
                    {t("edit.dateOfBirth")}
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <DatePicker
                        id={`${formId}-dob`}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={busy}
                        captionLayout="dropdown"
                        startMonth={DOB_START}
                        endMonth={DOB_END}
                        defaultMonth={DOB_DEFAULT_MONTH}
                        disabledDates={{ after: DOB_END }}
                        clearable
                      />
                    )}
                  />
                  {errors.dateOfBirth?.message ? (
                    <FieldError>{errors.dateOfBirth.message}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                {t("edit.cancel")}
              </Button>
              <Button type="submit" disabled={busy || isLoading}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("edit.submitting")}
                  </>
                ) : (
                  t("edit.submit")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
