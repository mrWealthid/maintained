"use client";

import { ArrowUpRightIcon, FolderSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function EmptyComponent({
  message = "No records found",
  description = `You haven&apos;t created any projects yet. Get started by creating
	your first project.`,
}: // onCreate,
{
  message?: string;
  description?: string;
  // onCreate?: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderSearch />
        </EmptyMedia>
        <EmptyTitle>{message}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* <div className="flex gap-2">
          <Button onClick={onCreate}>Create New</Button>
          <Button variant="outline">Import Project</Button>
        </div> */}
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        {/* <a href="#">
          Learn More <ArrowUpRightIcon />
        </a> */}
      </Button>
    </Empty>
  );
}
