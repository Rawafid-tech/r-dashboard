import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import type * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

function TableRowActionsMenu(
  props: React.ComponentProps<typeof DropdownMenu>,
) {
  return <DropdownMenu {...props} />;
}

interface TableRowActionsMenuTriggerProps {
  ariaLabel: string;
}

function TableRowActionsMenuTrigger({
  ariaLabel,
}: TableRowActionsMenuTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={ariaLabel}
        className="border-border/60 bg-background/80 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted data-[state=open]:text-foreground"
      >
        <MoreHorizontal aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
  );
}

function TableRowActionsMenuContent({
  className,
  align = "end",
  sideOffset = 6,
  collisionPadding = 16,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "min-w-[12rem] w-max max-w-[18rem] border border-border/80 bg-popover/95 p-1.5 shadow-lg backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function TableRowActionsMenuItem({
  className,
  icon: Icon,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  icon?: LucideIcon;
}) {
  return (
    <DropdownMenuItem
      className={cn("gap-2.5 rounded-md px-2.5 py-2 text-sm font-normal", className)}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </DropdownMenuItem>
  );
}

function TableRowActionsMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      className={cn("-mx-0 my-1.5 h-px bg-border/80", className)}
      {...props}
    />
  );
}

export {
  TableRowActionsMenu,
  TableRowActionsMenuContent,
  TableRowActionsMenuItem,
  TableRowActionsMenuSeparator,
  TableRowActionsMenuTrigger,
};
