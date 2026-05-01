"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ListDateFieldOption } from "@/shared/model/list-date-filter.model";

type HeaderActionSelectProps = {
  value: string;
  options: readonly ListDateFieldOption[];
  onChange: (value: string) => void;
  triggerClassName?: string;
};

export default function HeaderActionSelect({
  value,
  options,
  onChange,
  triggerClassName,
}: HeaderActionSelectProps) {
  const label = options.find((option) => option.value === value)?.label ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={triggerClassName ?? "shrink-0 justify-between border"}
        >
          {label}
          <ChevronDown className="ml-1 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
