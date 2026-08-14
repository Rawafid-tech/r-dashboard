import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { SenderLocationStatus } from "@/shared/types/enums";
import type { SenderLocation } from "@/features/locations/types";

export type LocationRowAction =
  | "edit"
  | "setDefault"
  | "activate"
  | "deactivate";

interface LocationRowActionsMenuProps {
  location: SenderLocation;
  onAction: (action: LocationRowAction, location: SenderLocation) => void;
}

export function LocationRowActionsMenu({
  location,
  onAction,
}: LocationRowActionsMenuProps) {
  const { t } = useTranslation("locations");
  const { hasPermission } = useMerchantPermissions();

  if (!hasPermission(MerchantPermission.SENDER_LOCATION_MANAGE)) {
    return null;
  }

  const isActive = location.status === SenderLocationStatus.ACTIVE;
  const canSetDefault =
    !location.isDefault && isActive;
  const canDeactivate = isActive && !location.isDefault;
  const canActivate = !isActive;

  const items: Array<{
    key: LocationRowAction;
    label: string;
    disabled?: boolean;
    tooltip?: string;
    destructive?: boolean;
  }> = [{ key: "edit", label: t("actions.edit") }];

  if (canSetDefault) {
    items.push({ key: "setDefault", label: t("actions.setDefault") });
  }

  if (canActivate) {
    items.push({ key: "activate", label: t("actions.activate") });
  }

  if (canDeactivate) {
    items.push({
      key: "deactivate",
      label: t("actions.deactivate"),
      destructive: true,
    });
  } else if (location.isDefault && isActive) {
    items.push({
      key: "deactivate",
      label: t("actions.deactivate"),
      disabled: true,
      tooltip: t("actions.defaultDeactivateTooltip"),
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
          aria-label={t("table.openMenu", { name: location.name })}
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

          const menuItem = (
            <DropdownMenuItem
              variant={item.destructive ? "destructive" : "default"}
              disabled={item.disabled}
              onSelect={() => {
                if (!item.disabled) onAction(item.key, location);
              }}
            >
              {item.label}
            </DropdownMenuItem>
          );

          return (
            <div key={item.key}>
              {showSeparator ? <DropdownMenuSeparator /> : null}
              {item.disabled && item.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block w-full">{menuItem}</span>
                  </TooltipTrigger>
                  <TooltipContent>{item.tooltip}</TooltipContent>
                </Tooltip>
              ) : (
                menuItem
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
