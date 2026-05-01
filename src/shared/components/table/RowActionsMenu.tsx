"use client";

import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { BaseActions, ConfirmActions } from "@/shared/model/model";

type RowActionsMenuProps<
  TBaseAction extends BaseActions = BaseActions,
  TConfirmKey extends string = string,
> = {
  ariaLabel: string;
  baseActions?: TBaseAction[];
  confirmActions?: Array<Omit<ConfirmActions, "key"> & { key: TConfirmKey }>;
  onConfirmAction?: (key: TConfirmKey) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderBaseAction?: (args: {
    action: TBaseAction;
    defaultItem: ReactNode;
  }) => ReactNode;
};

export default function RowActionsMenu<
  TBaseAction extends BaseActions = BaseActions,
  TConfirmKey extends string = string,
>({
  ariaLabel,
  baseActions = [],
  confirmActions = [],
  onConfirmAction,
  disabled,
  open,
  onOpenChange,
  renderBaseAction,
}: RowActionsMenuProps<TBaseAction, TConfirmKey>) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={ariaLabel}
          disabled={disabled}
        >
          <MoreVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 min-w-64">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {(baseActions.length > 0 || confirmActions.length > 0) ? (
          <DropdownMenuSeparator />
        ) : null}

        {baseActions.map((action) => {
          const Icon = action.icon;
          const defaultItem = (
            <DropdownMenuItem
              key={action.label}
              onClick={action.action}
              variant={action.variant}
              disabled={action.disabled}
              className={action.className}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          );

          return renderBaseAction
            ? renderBaseAction({
              action,
              defaultItem,
            })
            : defaultItem;
        })}

        {baseActions.length > 0 && confirmActions.length > 0 ? (
          <DropdownMenuSeparator />
        ) : null}

        {confirmActions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.key}
              variant={action.variant}
              onClick={() => onConfirmAction?.(action.key)}
              className={action.className}
              disabled={disabled}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
