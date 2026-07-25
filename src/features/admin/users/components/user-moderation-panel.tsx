import { useState } from "react";
import { Ban, Loader2, ShieldOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import { UserStatusBadge } from "@/features/admin/users/components/user-status-badge";
import { useModerateUser } from "@/features/admin/users/hooks/use-moderate-user";
import type { AdminUser } from "@/features/admin/users/types";
import { UserStatus } from "@/shared/types/enums";

interface UserModerationPanelProps {
  user: AdminUser;
  canModerate: boolean;
}

export function UserModerationPanel({
  user,
  canModerate,
}: UserModerationPanelProps) {
  const { t } = useTranslation("admin");
  const [sheetMode, setSheetMode] = useState<"suspend" | "reactivate" | null>(
    null,
  );
  const moderateMutation = useModerateUser(user.id, user.companyId);

  const isSuspended = user.status === UserStatus.SUSPENDED;
  const isPending = moderateMutation.isPending;

  const closeSheet = () => setSheetMode(null);

  const handleConfirm = async () => {
    try {
      if (sheetMode === "suspend") {
        await moderateMutation.mutateAsync({ status: UserStatus.SUSPENDED });
      } else if (sheetMode === "reactivate") {
        await moderateMutation.mutateAsync({ status: UserStatus.ACTIVE });
      }
      closeSheet();
    } catch {
      // Toast handled in mutation hook
    }
  };

  return (
    <>
      <Card className="border-border/80">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="grid size-9 place-items-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/15"
                aria-hidden="true"
              >
                <ShieldOff className="size-4" />
              </span>
              <div>
                <CardTitle>{t("users.detail.moderation.title")}</CardTitle>
                <CardDescription>
                  {t("users.detail.moderation.subtitle")}
                </CardDescription>
              </div>
            </div>
            <UserStatusBadge status={user.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canModerate ? (
            <p className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 text-sm text-muted-foreground">
              {t("users.detail.readOnlyHint")}
            </p>
          ) : null}

          <p className="text-sm leading-relaxed text-muted-foreground">
            {isSuspended
              ? t("users.detail.moderation.suspendedDescription")
              : t("users.detail.moderation.activeDescription")}
          </p>

          {canModerate ? (
            <div className="flex flex-wrap gap-2">
              {!isSuspended ? (
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setSheetMode("suspend")}
                >
                  <Ban aria-hidden="true" />
                  {t("users.detail.moderation.suspend")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setSheetMode("reactivate")}
                >
                  {t("users.detail.moderation.reactivate")}
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet
        open={sheetMode !== null}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === "suspend"
                ? t("users.detail.moderation.suspendTitle")
                : t("users.detail.moderation.reactivateTitle")}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === "suspend"
                ? t("users.detail.moderation.suspendDescription", {
                    name: user.fullName,
                  })
                : t("users.detail.moderation.reactivateDescription", {
                    name: user.fullName,
                  })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-row justify-end gap-2 p-4 pt-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {t("users.detail.moderation.cancel")}
              </Button>
            </SheetClose>
            <Button
              type="button"
              variant={sheetMode === "suspend" ? "destructive" : "default"}
              disabled={isPending}
              onClick={() => void handleConfirm()}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("users.detail.moderation.confirming")}
                </>
              ) : sheetMode === "suspend" ? (
                t("users.detail.moderation.confirmSuspend")
              ) : (
                t("users.detail.moderation.confirmReactivate")
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
