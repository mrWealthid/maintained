import type { MergeValue, MergeVars } from "@/lib/email/models/email.model";

export const EMAIL_TEXT_COLOR = "#334155";
export const EMAIL_MUTED_TEXT_COLOR = "#64748b";
export const EMAIL_LINK_COLOR = "#2563eb";

export function escapeHtml(value: MergeValue): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function truthy(value: MergeValue): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
}

export function renderTemplate(input: string, vars: MergeVars): string {
  const withConditionals = input.replace(
    /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key: string, content: string) => (truthy(vars[key]) ? content : ""),
  );

  return withConditionals.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_, key: string) => escapeHtml(vars[key]),
  );
}

export function normalizeTemplateText(text: string): string {
  const normalizedNewlines = text.replace(/\r\n?/g, "\n");
  const rawLines = normalizedNewlines.split("\n");

  while (rawLines.length && rawLines[0].trim() === "") rawLines.shift();
  while (rawLines.length && rawLines[rawLines.length - 1].trim() === "") {
    rawLines.pop();
  }

  return rawLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function asHtmlWithLinks(text: string) {
  const normalized = normalizeTemplateText(text);
  const lines = normalized.split(/\n{2,}/);

  return lines
    .map((line) => {
      const html = escapeHtml(line)
        .replace(/\n/g, "<br />")
        .replace(
          /(https?:\/\/[^\s<]+)/g,
          `<a href="$1" target="_blank" rel="noopener noreferrer" style="color:${EMAIL_LINK_COLOR};text-decoration:underline;font-weight:600">$1</a>`,
        );
      return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${EMAIL_TEXT_COLOR};">${html}</p>`;
    })
    .join("");
}

export function parseBcc(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
