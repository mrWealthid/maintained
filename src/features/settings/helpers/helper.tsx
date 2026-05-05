import { ImageIcon } from "lucide-react";

export type PreviewMergeVarValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type PreviewMergeVars = Record<string, PreviewMergeVarValue>;

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPreviewVarTruthy(value: PreviewMergeVarValue) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function resolveConditionalBlocks(
  text: string,
  variables: PreviewMergeVars = {},
) {
  const conditionalPattern =
    /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  let resolved = text;
  let previous = "";

  while (resolved !== previous) {
    previous = resolved;
    resolved = resolved.replace(
      conditionalPattern,
      (_match, key: string, content: string) =>
        isPreviewVarTruthy(variables[key]) ? content : "",
    );
  }

  return resolved;
}

function stripLinesForEmptyPreviewVars(
  text: string,
  variables: PreviewMergeVars = {},
) {
  const lineScopedKeys = ["confirmation_number"];
  const emptyKeys = lineScopedKeys.filter((key) => {
    const value = variables[key];
    return (
      value === undefined || value === null || String(value).trim() === ""
    );
  });

  if (!emptyKeys.length) {
    return text;
  }

  return text
    .split("\n")
    .filter((line) =>
      emptyKeys.every((key) => {
        const tokenPattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`);
        return !tokenPattern.test(line);
      }),
    )
    .join("\n");
}

export function replaceMergeVars(text: string, variables?: PreviewMergeVars) {
  const resolvedText = stripLinesForEmptyPreviewVars(
    resolveConditionalBlocks(text, variables),
    variables,
  );

  return resolvedText.replace(
    /\{\{([a-zA-Z0-9_]+)\}\}/g,
    (match, key: string) => {
      const value = variables?.[key];
      if (value === undefined || value === null) return match;
      return String(value);
    },
  );
}

export function renderInlineFormatting(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      parts.push(
        <span
          key={key++}
          className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-xs text-chart-2"
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
          className="text-chart-2 underline underline-offset-2"
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

export function renderFormattedPreview(
  text: string,
  variables?: PreviewMergeVars,
) {
  const replaced = replaceMergeVars(text, variables);
  const lines = replaced.split("\n");

  return lines.map((line, i) => {
    let processed = line;
    let className = "";

    if (processed.startsWith("## ")) {
      processed = processed.slice(3);
      return (
        <div
          key={i}
          className="mb-1 mt-3 text-base font-semibold text-foreground"
        >
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
