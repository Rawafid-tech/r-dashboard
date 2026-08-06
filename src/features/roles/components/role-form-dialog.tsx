import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from "@/shared/components/ui";
import { PermissionTree } from "@/features/roles/components/permission-tree";
import { useCreateRole } from "@/features/roles/hooks/use-create-role";
import { usePermissionsCatalog } from "@/features/roles/hooks/use-permissions-catalog";
import { useRole } from "@/features/roles/hooks/use-role";
import { useUpdateRole } from "@/features/roles/hooks/use-update-role";
import { filterPermissionTree } from "@/features/roles/lib/permission-tree";
import {
  applyRoleFieldErrors,
  isRoleApiErrorCode,
  toRoleUpsertPayload,
} from "@/features/roles/lib/role-form-errors";
import {
  createRoleSchema,
  EMPTY_ROLE_FORM_VALUES,
  type RoleFormValues,
} from "@/features/roles/schema";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { parseApiError } from "@/shared/api/error-handler";

interface RoleFormDialogProps {
  mode: "create" | "edit";
  roleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleFormDialog({
  mode,
  roleId,
  open,
  onOpenChange,
}: RoleFormDialogProps) {
  const { t, i18n } = useTranslation("roles");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const [treeFilter, setTreeFilter] = useState("");
  const deferredFilter = useDeferredValue(treeFilter);

  const isEdit = mode === "edit";
  const catalogQuery = usePermissionsCatalog({ enabled: open });
  const roleQuery = useRole(roleId, {
    enabled: open && isEdit && Boolean(roleId),
  });
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole(roleId ?? "");

  const schema = useMemo(
    () => createRoleSchema(t),
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
    defaultValues: EMPTY_ROLE_FORM_VALUES,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) {
      setTreeFilter("");
      reset(EMPTY_ROLE_FORM_VALUES);
      return;
    }

    if (isEdit && roleQuery.data) {
      reset({
        name: roleQuery.data.name,
        description: roleQuery.data.description ?? "",
        permissionIds: roleQuery.data.permissionIds,
      });
      return;
    }

    if (!isEdit) {
      reset(EMPTY_ROLE_FORM_VALUES);
    }
  }, [open, isEdit, roleQuery.data, reset]);

  const filteredRoots = useMemo(() => {
    const roots = catalogQuery.data ?? [];
    return filterPermissionTree(roots, deferredFilter);
  }, [catalogQuery.data, deferredFilter]);

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isLoadingEdit = isEdit && roleQuery.isLoading;

  const onSubmit = handleSubmit(async (values: RoleFormValues) => {
    const payload = toRoleUpsertPayload(values);

    try {
      if (isEdit) {
        if (!roleId) return;
        const updated = await updateMutation.mutateAsync(payload);
        reset({
          name: updated.name,
          description: updated.description ?? "",
          permissionIds: updated.permissionIds,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        reset({
          name: created.name,
          description: created.description ?? "",
          permissionIds: created.permissionIds,
        });
      }
      onOpenChange(false);
    } catch (error) {
      if (isRoleApiErrorCode(error, "auth.roleNameTaken")) {
        setError("name", {
          type: "server",
          message: parseApiError(error).detail || t("toast.nameTaken"),
        });
        return;
      }

      applyRoleFieldErrors(error, setError);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w6"
        className="gap-0 overflow-hidden"
        showCloseButton={!isSaving}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>
            {isEdit ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>

        {isLoadingEdit ? (
          <div
            className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("form.loadingRole")}
          </div>
        ) : null}

        {isEdit && roleQuery.isError ? (
          <div role="alert" className="space-y-3 px-4 py-5 sm:px-5">
            <p className="text-sm text-destructive">{t("toast.notFound")}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("form.cancel")}
            </Button>
          </div>
        ) : null}

        {!isLoadingEdit && !(isEdit && roleQuery.isError) ? (
          <form
            id={formId}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={onSubmit}
            noValidate
          >
            <DialogBody className="space-y-3.5">
              <FieldGroup className="gap-3.5">
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor={`${formId}-name`}>
                    {t("form.name")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    autoComplete="off"
                    placeholder={t("form.namePlaceholder")}
                    aria-invalid={Boolean(errors.name) || undefined}
                    disabled={isSaving}
                    {...register("name")}
                  />
                  {errors.name?.message ? (
                    <FieldError>{errors.name.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.description) || undefined}>
                  <FieldLabel htmlFor={`${formId}-description`}>
                    {t("form.roleDescription")}
                  </FieldLabel>
                  <Textarea
                    id={`${formId}-description`}
                    rows={2}
                    placeholder={t("form.roleDescriptionPlaceholder")}
                    aria-invalid={Boolean(errors.description) || undefined}
                    disabled={isSaving}
                    {...register("description")}
                  />
                  {errors.description?.message ? (
                    <FieldError>{errors.description.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.permissionIds) || undefined}>
                  <div className="flex items-end justify-between gap-2">
                    <FieldLabel htmlFor={`${formId}-permissions-search`}>
                      {t("form.permissions")}
                    </FieldLabel>
                    <FieldDescription className="m-0 text-[11px]">
                      {t("form.permissionsHintShort")}
                    </FieldDescription>
                  </div>

                  <Input
                    id={`${formId}-permissions-search`}
                    value={treeFilter}
                    onChange={(event) => setTreeFilter(event.target.value)}
                    placeholder={t("form.permissionsSearchPlaceholder")}
                    aria-label={t("form.permissionsSearch")}
                    disabled={isSaving || catalogQuery.isLoading}
                    className="mt-1.5 h-9"
                  />

                  <div className="mt-2">
                    {catalogQuery.isLoading ? (
                      <div
                        className="flex items-center justify-center gap-2 rounded-lg border border-border/70 py-8 text-sm text-muted-foreground"
                        role="status"
                      >
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        {tCommon("common.loading")}
                      </div>
                    ) : null}

                    {catalogQuery.isError ? (
                      <div
                        role="alert"
                        className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
                      >
                        <p>{t("form.permissionsLoadFailed")}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => void catalogQuery.refetch()}
                        >
                          {t("errors.retry")}
                        </Button>
                      </div>
                    ) : null}

                    {!catalogQuery.isLoading &&
                    !catalogQuery.isError &&
                    filteredRoots.length === 0 ? (
                      <p
                        className="rounded-lg border border-dashed border-border/70 px-2 py-8 text-center text-sm text-muted-foreground"
                        role="status"
                      >
                        {t("form.permissionsEmpty")}
                      </p>
                    ) : null}

                    {!catalogQuery.isLoading &&
                    !catalogQuery.isError &&
                    filteredRoots.length > 0 ? (
                      <Controller
                        control={control}
                        name="permissionIds"
                        render={({ field }) => (
                          <PermissionTree
                            roots={filteredRoots}
                            selectedIds={field.value}
                            onChange={field.onChange}
                            disabled={isSaving}
                            idPrefix={`${formId}-perm`}
                            forceExpandAll={deferredFilter.trim().length > 0}
                          />
                        )}
                      />
                    ) : null}
                  </div>

                  {errors.permissionIds?.message ? (
                    <FieldError>{errors.permissionIds.message}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving || isLoadingEdit}>
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("form.saving")}
                  </>
                ) : (
                  t("form.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
