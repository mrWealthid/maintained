import type { LucideIcon } from "lucide-react";

export interface ActionConfirmConfig {
  title: string;
  describe: (count: number) => string;
  confirmLabel: string;
  variant: "default" | "destructive";
  icon: LucideIcon;
}

export interface SelectionActionRenderArgs<T> {
  selectedRows: T[];
  clearSelection: () => void;
}
