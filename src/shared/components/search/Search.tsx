import React, { FC } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchProps {
  placeHolder: string;
  onSearch: (val: string) => void;
  value?: string;
  className?: string;
  inputClassName?: string;
}

const Search: FC<SearchProps> = ({
  placeHolder,
  onSearch,
  value,
  className,
  inputClassName,
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-2 rounded-full border bg-background/80 px-3 py-2.5 transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background dark:bg-muted/60",
        className,
      )}
    >
      <SearchIcon
        width={14}
        height={14}
        className="text-muted-foreground shrink-0"
      />
      <input
        type="search"
        id="search"
        name="search"
        className={cn(
          "w-full border-none bg-transparent text-xs text-foreground outline-hidden placeholder:text-muted-foreground/70 focus-visible:outline-hidden focus-visible:ring-0",
          inputClassName,
        )}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeHolder}
        {...(value !== undefined ? { value } : {})}
      />
    </div>
  );
};

export default React.memo(Search);
