"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { useHasPermission } from "@/shared/hooks/usePermission";
import type { Category, TicketType } from "@/shared/model/model";
import {
  useCreateCategory,
  useCreateTicketType,
} from "@/features/settings/hooks/settingsHooks";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { fetchTicketCategory } from "../../services/ticket-service";

export function CategoryCombobox({
  initialCategory,
  onChange,
  disabled,
}: {
  initialCategory?: Category;
  onChange: (category: Category) => void;
  disabled?: boolean;
}) {
  const { watch } = useFormContext<TicketCreateFormValues>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Category | undefined>(initialCategory);
  const value = watch("category");
  const { data, isLoading } = useQuery({
    queryKey: ["category", search],
    queryFn: () => fetchTicketCategory<Category>(search || null),
  });
  const canCreate = useHasPermission(PERMISSION.TICKET_CATEGORIES_MANAGE);
  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateCategory();
  const categories = (data?.data || []) as Category[];
  const display =
    selected?.name ||
    categories.find((category) => category.id === value)?.name ||
    "";
  const trimmedSearch = search.trim();
  const showCreate =
    canCreate &&
    Boolean(trimmedSearch) &&
    !categories.some(
      (category) => category.name.toLowerCase() === trimmedSearch.toLowerCase(),
    );

  async function handleCreate() {
    if (!showCreate) return;
    const result = await createCategory({
      name: trimmedSearch,
      description: "",
      isActive: true,
    });
    const created = result?.data as Category | undefined;
    if (!created) return;
    setSelected(created);
    onChange(created);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="category-combobox"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isCreating}
          className="h-10 w-full justify-between rounded-xl font-normal"
        >
          <span className={cn(!display && "text-muted-foreground")}>
            {display || "Select a category..."}
          </span>
          {isCreating ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-70" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={
              canCreate ? "Search or create category..." : "Search categories..."
            }
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {showCreate ? (
              <CommandGroup heading="Create">
                <CommandItem
                  onSelect={() => void handleCreate()}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isCreating
                    ? `Creating "${trimmedSearch}"...`
                    : `Create "${trimmedSearch}"`}
                </CommandItem>
              </CommandGroup>
            ) : null}
            {isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {!categories.length && !showCreate ? (
                  <CommandEmpty>No categories found.</CommandEmpty>
                ) : null}
                <CommandGroup heading="Categories">
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => {
                        setSelected(category);
                        onChange(category);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          (selected?.id || value) === category.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        {category.description ? (
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function TicketTypeCombobox({
  value,
  types,
  onChange,
  disabled,
}: {
  value?: string;
  types: TicketType[];
  onChange: (type: TicketType) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const canCreate = useHasPermission(PERMISSION.TICKET_TYPES_MANAGE);
  const { mutateAsync: createTicketType, isPending: isCreating } =
    useCreateTicketType();
  const trimmedSearch = search.trim();
  const filtered = trimmedSearch
    ? types.filter((type) =>
        type.name.toLowerCase().includes(trimmedSearch.toLowerCase()),
      )
    : types;
  const showCreate =
    canCreate &&
    Boolean(trimmedSearch) &&
    !types.some((type) => type.name.toLowerCase() === trimmedSearch.toLowerCase());
  const display = types.find((type) => type.id === value)?.name || "";

  async function handleCreate() {
    if (!showCreate) return;
    const result = await createTicketType({
      name: trimmedSearch,
      description: "",
      isActive: true,
    });
    const created = result?.data as TicketType | undefined;
    if (!created) return;
    onChange(created);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isCreating}
          className="h-10 w-full justify-between rounded-xl font-normal"
        >
          <span
            className={cn(
              "flex min-w-0 items-center gap-2 truncate",
              !display && "text-muted-foreground",
            )}
          >
            <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{display || "Select a ticket type"}</span>
          </span>
          {isCreating ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-70" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={
              canCreate ? "Search or create ticket type..." : "Search ticket types..."
            }
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {showCreate ? (
              <CommandGroup heading="Create">
                <CommandItem
                  onSelect={() => void handleCreate()}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isCreating
                    ? `Creating "${trimmedSearch}"...`
                    : `Create "${trimmedSearch}"`}
                </CommandItem>
              </CommandGroup>
            ) : null}
            {!filtered.length && !showCreate ? (
              <CommandEmpty>No ticket types found.</CommandEmpty>
            ) : null}
            <CommandGroup heading="Ticket Types">
              {filtered.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.id}
                  onSelect={() => {
                    onChange(type);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === type.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{type.name}</span>
                    {type.description ? (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
