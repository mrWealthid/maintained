import { randomUUID } from "crypto";

const MAX_BASE_LEN = 60;
const SHORT_ID_LEN = 6;
const SHORT_ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

const COMBINING_DIACRITICS = /[̀-ͯ]/gu;

export function slugify(input: string): string {
  if (!input) return "";
  const normalized = input.normalize("NFKD").replace(COMBINING_DIACRITICS, "");
  const ascii = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.slice(0, MAX_BASE_LEN).replace(/-+$/g, "");
}

export function shortId(len: number = SHORT_ID_LEN): string {
  const hex = randomUUID().replace(/-/g, "");
  let out = "";
  for (let i = 0; i < len; i++) {
    const nibble = parseInt(hex[i] ?? "0", 16);
    out += SHORT_ID_ALPHABET[nibble % SHORT_ID_ALPHABET.length];
  }
  return out;
}

export function buildTicketSlug(title: string): string {
  const base = slugify(title) || "ticket";
  return `${base}-${shortId()}`;
}

export function isSlugDuplicateKeyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: number; keyPattern?: Record<string, unknown> };
  return e.code === 11000 && Boolean(e.keyPattern && "slug" in e.keyPattern);
}
