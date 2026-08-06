import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { nextStatusAction } from "@/features/users/components/user-status-confirm-dialog";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { UserStatus } from "@/shared/types/enums";
import type { CompanyUser } from "@/features/users/types";

export type UserRowAction =
  | "edit"
  | "role"
  | "activate"
  | "deactivate"
  | "reveal"
  | "setPassword"
  | "delete";

interface UserRowActionsMenuProps {
  user: CompanyUser;
  currentUserId?: string;
  onAction: (action: UserRowAction, user: CompanyUser) => void;
}

export function UserRowActionsMenu({
  user,
  currentUserId,
  onAction,
}: UserRowActionsMenuProps) {
  const { t } = useTranslation("users");
  const { hasPermission } = useMerchantPermissions();

  if (user.owner) return null;

  const canManage = hasPermission(MerchantPermission.USER_MANAGE);
  const canReveal = hasPermission(MerchantPermission.USER_INVITE_REVEAL);
  const canSetPassword = hasPermission(MerchantPermission.USER_PASSWORD_SET);
  const isInvited = user.status === UserStatus.INVITED;
  const statusAction = nextStatusAction(user.status);
  const isSelf = currentUserId === user.id;

  const items: Array<{ key: UserRowAction; label: string; destructive?: boolean }> =
    [];

  if (canManage) {
    items.push({ key: "edit", label: t("actions.edit") });
    items.push({ key: "role", label: t("actions.changeRole") });
  }

  if (canManage && statusAction === "deactivate") {
    items.push({ key: "deactivate", label: t("actions.deactivate") });
  }

  if (canManage && statusAction === "activate") {
    items.push({ key: "activate", label: t("actions.activate") });
  }

  if (canReveal && isInvited) {
    items.push({ key: "reveal", label: t("actions.revealLink") });
  }

  if (canSetPassword) {
    items.push({ key: "setPassword", label: t("actions.setPassword") });
  }

  if (canManage && !isSelf) {
    items.push({
      key: "delete",
      label: t("actions.delete"),
      destructive: true,
    });
  }

  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", { name: user.fullName })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {items.map((item, index) => {
          const showSeparator =
            item.destructive &&
            index > 0 &&
            !items[index - 1]?.destructive;

          return (
            <div key={item.key}>
              {showSeparator ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                variant={item.destructive ? "destructive" : "default"}
                onSelect={() => onAction(item.key, user)}
              >
                {item.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
