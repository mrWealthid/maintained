"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  Link2,
  Loader2,
  List,
  Mail,
  PencilLine,
  Redo2,
  Send,
  Sparkles,
  Type,
  Undo2,
  Users,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AUDIENCE_MESSAGE_COMPOSE_MODE,
  AudienceMessageContentSchema,
  type AudienceMessageContent,
} from "@/shared/model/audience-message.model";

type BulkAudienceMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  audienceLabel: string;
  recipientCount: number;
  selectedRecipientEmails?: string[];
  isSending: boolean;
  onSubmit: (values: AudienceMessageContent) => Promise<void>;
};

const DEFAULT_VALUES: AudienceMessageContent = {
  composeMode: AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE,
  subject: "",
  message: "",
};

function renderInlineFormatting(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      parts.push(
        <span
          key={key++}
          className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-xs text-primary"
        >
          <ImageIcon className="h-3 w-3" />
          {imgMatch[1] || "image"}
        </span>,
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-primary underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {boldMatch[1]}
        </strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^_(.+?)_/);
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.slice(1).search(/!\[|\[|\*\*|_/);
    if (nextSpecial === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      remaining = "";
    } else {
      parts.push(<span key={key++}>{remaining.slice(0, nextSpecial + 1)}</span>);
      remaining = remaining.slice(nextSpecial + 1);
    }
  }

  return <>{parts}</>;
}

function renderFormattedPreview(text: string) {
  return text.split("\n").map((line, i) => {
    let processed = line;
    let className = "";

    if (processed.startsWith("## ")) {
      processed = processed.slice(3);
      return (
        <div key={i} className="mb-1 mt-3 text-base font-semibold text-foreground">
          {renderInlineFormatting(processed)}
        </div>
      );
    }

    if (processed.startsWith(">>>") && processed.endsWith("<<<")) {
      processed = processed.slice(3, -3);
      className = "text-center";
    }

    if (processed.startsWith("- ")) {
      processed = processed.slice(2);
      return (
        <div key={i} className={`flex gap-2 ${className}`}>
          <span className="select-none text-muted-foreground">•</span>
          <span>{renderInlineFormatting(processed)}</span>
        </div>
      );
    }

    if (processed.trim() === "") return <div key={i} className="h-3" />;

    return (
      <div key={i} className={className}>
        {renderInlineFormatting(processed)}
      </div>
    );
  });
}

function renderPreviewContent(text: string) {
  return (
    <div className="space-y-1 text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_em]:italic [&_strong]:font-semibold">
      {renderFormattedPreview(text)}
    </div>
  );
}

export default function BulkAudienceMessageDialog({
  open,
  onOpenChange,
  title,
  description,
  audienceLabel,
  recipientCount,
  selectedRecipientEmails = [],
  isSending,
  onSubmit,
}: BulkAudienceMessageDialogProps) {
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [history, setHistory] = useState<string[]>([DEFAULT_VALUES.message]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const messageFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<AudienceMessageContent>({
    resolver: zodResolver(AudienceMessageContentSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const composeMode =
    useWatch({
      control: form.control,
      name: "composeMode",
    }) ?? AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE;
  const subjectPreview =
    useWatch({
      control: form.control,
      name: "subject",
    }) ?? "";
  const messagePreview =
    useWatch({
      control: form.control,
      name: "message",
    }) ?? "";

  function resetComposerState() {
    setView("edit");
    setHistory([DEFAULT_VALUES.message]);
    setHistoryIndex(0);
    setShowLinkForm(false);
    setShowImageForm(false);
    setLinkUrl("");
    setLinkText("");
    setImageUrl("");
    setImageAlt("");
  }

  function setMessageValue(nextValue: string, pushToHistory = true) {
    form.setValue("message", nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (!pushToHistory) {
      return;
    }

    setHistory((previousHistory) => {
      const baseHistory = previousHistory.slice(0, historyIndex + 1);
      const currentValue = baseHistory[baseHistory.length - 1] ?? "";

      if (currentValue === nextValue) {
        return previousHistory;
      }

      const nextHistory = [...baseHistory, nextValue];
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }

  function focusMessageField(cursorPosition?: number) {
    requestAnimationFrame(() => {
      const field = messageFieldRef.current;

      if (!field) {
        return;
      }

      field.focus();

      if (typeof cursorPosition === "number") {
        field.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  }

  function getMessageSelection() {
    const field = messageFieldRef.current;
    const currentValue = form.getValues("message");

    if (!field) {
      return {
        start: currentValue.length,
        end: currentValue.length,
        selected: "",
      };
    }

    const start = field.selectionStart ?? 0;
    const end = field.selectionEnd ?? 0;

    return {
      start,
      end,
      selected: currentValue.slice(start, end),
    };
  }

  function replaceMessageRange(start: number, end: number, replacement: string) {
    const currentValue = form.getValues("message");
    const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`;

    setMessageValue(nextValue);
    focusMessageField(start + replacement.length);
  }

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    const { start, end, selected } = getMessageSelection();
    const text = selected || placeholder;

    replaceMessageRange(start, end, `${prefix}${text}${suffix}`);
  }

  function prependToLine(prefix: string) {
    const { start } = getMessageSelection();
    const currentValue = form.getValues("message");
    const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = currentValue.indexOf("\n", start);
    const actualLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
    const line = currentValue.slice(lineStart, actualLineEnd);

    if (line.startsWith(prefix)) {
      replaceMessageRange(lineStart, actualLineEnd, line.slice(prefix.length));
      return;
    }

    replaceMessageRange(lineStart, actualLineEnd, `${prefix}${line}`);
  }

  function formatAlignLeft() {
    const { start } = getMessageSelection();
    const currentValue = form.getValues("message");
    const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = currentValue.indexOf("\n", start);
    const actualLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
    const line = currentValue.slice(lineStart, actualLineEnd);
    const cleaned = line.replace(/^>>>/, "").replace(/<<<$/, "");

    replaceMessageRange(lineStart, actualLineEnd, cleaned);
  }

  function formatAlignCenter() {
    const { start } = getMessageSelection();
    const currentValue = form.getValues("message");
    const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = currentValue.indexOf("\n", start);
    const actualLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
    const line = currentValue.slice(lineStart, actualLineEnd);

    if (line.startsWith(">>>") && line.endsWith("<<<")) {
      replaceMessageRange(lineStart, actualLineEnd, line.slice(3, -3));
      return;
    }

    replaceMessageRange(lineStart, actualLineEnd, `>>>${line}<<<`);
  }

  function openLinkForm() {
    const { selected } = getMessageSelection();

    setLinkText(selected || "");
    setLinkUrl("");
    setShowImageForm(false);
    setShowLinkForm(true);
  }

  function insertLink() {
    if (!linkUrl.trim()) {
      return;
    }

    const { start, end } = getMessageSelection();
    const text = linkText.trim() || linkUrl.trim();

    replaceMessageRange(start, end, `[${text}](${linkUrl.trim()})`);
    setShowLinkForm(false);
    setLinkUrl("");
    setLinkText("");
  }

  function openImageForm() {
    setImageUrl("");
    setImageAlt("");
    setShowLinkForm(false);
    setShowImageForm(true);
  }

  function insertImage() {
    if (!imageUrl.trim()) {
      return;
    }

    const { start, end } = getMessageSelection();

    replaceMessageRange(start, end, `![${imageAlt.trim() || "image"}](${imageUrl.trim()})`);
    setShowImageForm(false);
    setImageUrl("");
    setImageAlt("");
  }

  function undo() {
    if (historyIndex <= 0) {
      return;
    }

    const nextIndex = historyIndex - 1;

    setHistoryIndex(nextIndex);
    setMessageValue(history[nextIndex] ?? "", false);
    focusMessageField();
  }

  function redo() {
    if (historyIndex >= history.length - 1) {
      return;
    }

    const nextIndex = historyIndex + 1;

    setHistoryIndex(nextIndex);
    setMessageValue(history[nextIndex] ?? "", false);
    focusMessageField();
  }

  function handleMessageKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const modifierKey = event.metaKey || event.ctrlKey;

    if (!modifierKey) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "b":
        event.preventDefault();
        wrapSelection("**", "**", "bold text");
        return;
      case "i":
        event.preventDefault();
        wrapSelection("_", "_", "italic text");
        return;
      case "k":
        event.preventDefault();
        openLinkForm();
        return;
      case "z":
        event.preventDefault();
        if (event.shiftKey) {
          redo();
          return;
        }
        undo();
        return;
      default:
        return;
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      resetComposerState();
    }

    onOpenChange(nextOpen);
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset(DEFAULT_VALUES);
    resetComposerState();
    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-3xl lg:max-w-4xl"
      >
        <SheetHeader className="border-b px-6 pb-4 pt-6 pr-14 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary dark:border-primary/40/40 dark:bg-primary/10/30 dark:text-primary">
              <Mail className="size-5" />
            </div>

            <div className="space-y-1">
              <SheetTitle className="text-xl leading-tight font-semibold tracking-tight">
                {title}
              </SheetTitle>
              <SheetDescription className="text-sm leading-6 text-muted-foreground">
                {description}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Form {...form} schema={AudienceMessageContentSchema}>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-5 px-6 py-5">
                <div className="flex items-center justify-end">
                  <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
                    <button
                      type="button"
                      onClick={() => setView("edit")}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "edit"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <PencilLine className="size-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setView("preview")}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "preview"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Audience
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {audienceLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mail className="size-4" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Recipients
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {recipientCount} selected
                      </p>
                    </div>
                  </div>
                </div>

                {selectedRecipientEmails.length ? (
                  <div className="space-y-3 rounded-xl border border-border bg-card/70 p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Selected recipient emails
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipientEmails.map((email) => (
                        <Badge
                          key={email}
                          variant="plain"
                          className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-background text-xs font-medium"
                        >
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>

                  <div>
                    {composeMode === AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE ? (
                      <>
                        Uses the configurable{" "}
                        <span className="font-medium text-foreground">
                          Audience Message
                        </span>{" "}
                        email template from business email settings. Your subject
                        and message are inserted into that template before
                        delivery.
                      </>
                    ) : (
                      <>
                        Sends your subject and message directly without the
                        business email template body. The configured sender
                        identity is still used.
                      </>
                    )}
                  </div>
                </div>

                {view === "edit" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="composeMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Sparkles className="size-4 text-muted-foreground" />
                            Compose mode
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid gap-3 sm:grid-cols-2"
                              disabled={isSending}
                            >
                              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                                <RadioGroupItem
                                  value={AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE}
                                  className="mt-0.5"
                                />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">
                                    Use template
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Wrap the message in the business Audience
                                    Message template.
                                  </p>
                                </div>
                              </label>

                              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                                <RadioGroupItem
                                  value={AUDIENCE_MESSAGE_COMPOSE_MODE.PLAIN}
                                  className="mt-0.5"
                                />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">
                                    Send plain email
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Send the composed subject and message directly
                                    without the template body.
                                  </p>
                                </div>
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the email subject"
                              disabled={isSending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => {
                        const { ref: fieldRef, ...fieldProps } = field;

                        return (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FileText className="size-4 text-muted-foreground" />
                              Message
                            </FormLabel>
                            <TooltipProvider delayDuration={200}>
                              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/20 p-2">
                                <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => wrapSelection("**", "**", "bold text")}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <Bold className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Bold (Ctrl+B)</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => wrapSelection("_", "_", "italic text")}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <Italic className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Italic (Ctrl+I)</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={openLinkForm}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <Link2 className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Insert link (Ctrl+K)</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={openImageForm}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <ImageIcon className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Insert image</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => prependToLine("- ")}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <List className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Bullet list</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={formatAlignLeft}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <AlignLeft className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Align left</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={formatAlignCenter}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <AlignCenter className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Center</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => prependToLine("## ")}
                                        disabled={isSending}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                                      >
                                        <Type className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Heading</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Separator orientation="vertical" className="mx-1 h-5" />

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={undo}
                                        disabled={isSending || historyIndex <= 0}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                                      >
                                        <Undo2 className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Undo (Ctrl+Z)</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={redo}
                                        disabled={isSending || historyIndex >= history.length - 1}
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                                      >
                                        <Redo2 className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Redo (Ctrl+Shift+Z)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Code className="size-3.5" />
                                  Uses the same markdown-style editing flow as email settings.
                                </div>
                              </div>
                            </TooltipProvider>
                            {showLinkForm ? (
                              <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="bulk-message-link-text">Link text</Label>
                                  <Input
                                    id="bulk-message-link-text"
                                    value={linkText}
                                    onChange={(event) => setLinkText(event.target.value)}
                                    placeholder="View event details"
                                    disabled={isSending}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="bulk-message-link-url">Link URL</Label>
                                  <Input
                                    id="bulk-message-link-url"
                                    value={linkUrl}
                                    onChange={(event) => setLinkUrl(event.target.value)}
                                    placeholder="https://..."
                                    disabled={isSending}
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-2 sm:col-span-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowLinkForm(false)}
                                    disabled={isSending}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={insertLink}
                                    disabled={isSending || !linkUrl.trim()}
                                  >
                                    Insert link
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                            {showImageForm ? (
                              <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="bulk-message-image-alt">Image label</Label>
                                  <Input
                                    id="bulk-message-image-alt"
                                    value={imageAlt}
                                    onChange={(event) => setImageAlt(event.target.value)}
                                    placeholder="Event flyer"
                                    disabled={isSending}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="bulk-message-image-url">Image URL</Label>
                                  <Input
                                    id="bulk-message-image-url"
                                    value={imageUrl}
                                    onChange={(event) => setImageUrl(event.target.value)}
                                    placeholder="https://..."
                                    disabled={isSending}
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-2 sm:col-span-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowImageForm(false)}
                                    disabled={isSending}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={insertImage}
                                    disabled={isSending || !imageUrl.trim()}
                                  >
                                    Insert image
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                            <FormControl>
                              <Textarea
                                {...fieldProps}
                                ref={(element) => {
                                  fieldRef(element);
                                  messageFieldRef.current = element;
                                }}
                                placeholder="Write the message you want recipients to receive"
                                className="min-h-40 resize-y"
                                disabled={isSending}
                                onKeyDown={handleMessageKeyDown}
                                onChange={(event) => {
                                  setMessageValue(event.target.value);
                                }}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Supports the same body formatting style used in email
                              settings, including undo, links, lists, headings, and
                              alignment.
                            </p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card">
                      <div className="space-y-2 border-b border-border px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">Mode</span>
                          <span className="text-xs font-medium text-foreground">
                            {composeMode === AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE
                              ? "Use template"
                              : "Send plain email"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">To</span>
                          <span className="text-xs text-foreground">
                            Sample recipient ({recipientCount} selected)
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs text-muted-foreground">Subject</span>
                          <span className="text-right text-sm font-semibold text-foreground">
                            {subjectPreview.trim() || "Your subject will appear here"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 px-5 py-5">
                        {composeMode === AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE ? (
                          <>
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                              <p className="text-sm text-foreground">
                                Hi Jane Smith,
                              </p>
                              <div className="mt-3 space-y-3">
                                {messagePreview.trim()
                                  ? renderPreviewContent(messagePreview)
                                  : (
                                    <p className="text-sm italic text-muted-foreground">
                                      Your typed message will appear here.
                                    </p>
                                  )}
                              </div>
                              <p className="mt-4 text-sm text-foreground/90">
                                Related events: Annual Tech Conference 2026,
                                Volunteer Orientation
                              </p>
                              <p className="mt-4 text-sm text-foreground/90">
                                This message was sent to {audienceLabel}.
                              </p>
                              <p className="mt-4 text-sm text-foreground/90">
                                If you have questions, kindly contact the event
                                contact person.
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Template preview shows your subject and message
                              inserted into the Audience Message template flow.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                              <p className="text-sm text-foreground">
                                Hi Jane Smith,
                              </p>
                              <div className="mt-3 space-y-3">
                                {messagePreview.trim()
                                  ? renderPreviewContent(messagePreview)
                                  : (
                                    <p className="text-sm italic text-muted-foreground">
                                      Your typed message will appear here.
                                    </p>
                                  )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Plain email preview sends your composed subject and
                              message directly without the business template body.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Send email
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
