import { useState } from "react";
import { Archive, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import {
  useActivatePlan,
  useArchivePlan,
} from "@/features/admin/plans/hooks/use-plan-lifecycle";
import type { AdminPlan } from "@/features/admin/plans/types";
import { PlanStatus } from "@/shared/types/enums";

interface PlanLifecycleActionsProps {
  plan: AdminPlan;
}

export function PlanLifecycleActions({ plan }: PlanLifecycleActionsProps) {
  const { t } = useTranslation("admin");
  const [sheetMode, setSheetMode] = useState<"archive" | "activate" | null>(
    null,
  );
  const archiveMutation = useArchivePlan(plan.id);
  const activateMutation = useActivatePlan(plan.id);

  const isArchived = plan.status === PlanStatus.ARCHIVED;
  const canArchive = !plan.isDefault && !isArchived;
  const canActivate = isArchived;

  const closeSheet = () => setSheetMode(null);

  const handleConfirm = async () => {
    try {
      if (sheetMode === "archive") {
        await archiveMutation.mutateAsync();
      } else if (sheetMode === "activate") {
        await activateMutation.mutateAsync();
      }
      closeSheet();
    } catch {
      // Toast handled in mutation hooks
    }
  };

  const isPending = archiveMutation.isPending || activateMutation.isPending;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canArchive ? (
          <Button
            type="button"
            variant="destructive-outline"
            size="sm"
            onClick={() => setSheetMode("archive")}
          >
            <Archive aria-hidden="true" />
            {t("plans.lifecycle.archive")}
          </Button>
        ) : null}

        {canActivate ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSheetMode("activate")}
          >
            <RotateCcw aria-hidden="true" />
            {t("plans.lifecycle.activate")}
          </Button>
        ) : null}

        {plan.isDefault ? (
          <p className="text-xs text-muted-foreground">
            {t("plans.lifecycle.defaultHint")}
          </p>
        ) : null}
      </div>

      <Sheet
        open={sheetMode !== null}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === "archive"
                ? t("plans.lifecycle.archiveTitle")
                : t("plans.lifecycle.activateTitle")}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === "archive"
                ? t("plans.lifecycle.archiveDescription", {
                    name: plan.code,
                  })
                : t("plans.lifecycle.activateDescription", {
                    name: plan.code,
                  })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-row justify-end gap-2 p-4 pt-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {t("plans.lifecycle.cancel")}
              </Button>
            </SheetClose>
            <Button
              type="button"
              variant={sheetMode === "archive" ? "destructive" : "default"}
              disabled={isPending}
              onClick={() => void handleConfirm()}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("plans.lifecycle.confirming")}
                </>
              ) : sheetMode === "archive" ? (
                t("plans.lifecycle.confirmArchive")
              ) : (
                t("plans.lifecycle.confirmActivate")
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
