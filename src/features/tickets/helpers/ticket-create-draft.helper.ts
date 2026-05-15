import type { TicketCreateFormValues } from "@/features/tickets/models/ticket-form.model";

const TICKET_CREATE_DRAFT_STORAGE_VERSION = 1;
const TICKET_CREATE_DRAFT_STORAGE_PREFIX = "maintain:ticket:createDraft";
const TICKET_CREATE_DRAFT_FALLBACK_WORKSPACE = "workspace";
const TICKET_CREATE_DRAFT_FALLBACK_USER = "user";

export type TicketCreateDraft = {
  id: string;
  version: typeof TICKET_CREATE_DRAFT_STORAGE_VERSION;
  workspaceId: string;
  userKey: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  values: TicketCreateFormValues;
};

type TicketCreateDraftsCollection = {
  version: typeof TICKET_CREATE_DRAFT_STORAGE_VERSION;
  workspaceId: string;
  userKey: string;
  drafts: TicketCreateDraft[];
};

type TicketCreateDraftStorageKeyArgs = {
  workspaceId?: string | null;
  userEmail?: string | null;
};

type SaveTicketCreateDraftArgs = TicketCreateDraftStorageKeyArgs & {
  values: TicketCreateFormValues;
  name?: string;
};

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function normalizeKeySegment(
  value: string | null | undefined,
  fallback: string,
) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? encodeURIComponent(normalized) : fallback;
}

export function buildTicketCreateDraftStorageKey(
  args: TicketCreateDraftStorageKeyArgs,
) {
  const workspaceId = normalizeKeySegment(
    args.workspaceId,
    TICKET_CREATE_DRAFT_FALLBACK_WORKSPACE,
  );
  const userKey = normalizeKeySegment(
    args.userEmail,
    TICKET_CREATE_DRAFT_FALLBACK_USER,
  );

  return `${TICKET_CREATE_DRAFT_STORAGE_PREFIX}:v${TICKET_CREATE_DRAFT_STORAGE_VERSION}:${workspaceId}:${userKey}`;
}

function generateDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function prepareTicketCreateDraftValues(
  values: TicketCreateFormValues,
): TicketCreateFormValues {
  return {
    ...values,
    images: null,
    videos: null,
    documents: null,
  };
}

function loadTicketCreateDraftsCollection(
  storageKey: string,
): TicketCreateDraftsCollection | null {
  if (!canUseLocalStorage()) return null;

  try {
    const rawData = window.localStorage.getItem(storageKey);
    if (!rawData) return null;

    const parsed = JSON.parse(rawData) as TicketCreateDraftsCollection;
    if (parsed.version !== TICKET_CREATE_DRAFT_STORAGE_VERSION) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function loadTicketCreateDrafts(storageKey: string) {
  const collection = loadTicketCreateDraftsCollection(storageKey);
  return collection?.drafts ?? [];
}

export function saveTicketCreateDraft(args: SaveTicketCreateDraftArgs) {
  if (!canUseLocalStorage()) return null;

  const workspaceId = normalizeKeySegment(
    args.workspaceId,
    TICKET_CREATE_DRAFT_FALLBACK_WORKSPACE,
  );
  const userKey = normalizeKeySegment(
    args.userEmail,
    TICKET_CREATE_DRAFT_FALLBACK_USER,
  );
  const storageKey = buildTicketCreateDraftStorageKey(args);
  const now = new Date().toISOString();
  const draftName = args.name || `Draft ${new Date().toLocaleDateString()}`;
  const newDraft: TicketCreateDraft = {
    id: generateDraftId(),
    version: TICKET_CREATE_DRAFT_STORAGE_VERSION,
    workspaceId,
    userKey,
    name: draftName,
    createdAt: now,
    updatedAt: now,
    values: prepareTicketCreateDraftValues(args.values),
  };

  try {
    const collection = loadTicketCreateDraftsCollection(storageKey) ?? {
      version: TICKET_CREATE_DRAFT_STORAGE_VERSION,
      workspaceId,
      userKey,
      drafts: [],
    };

    collection.drafts.push(newDraft);
    window.localStorage.setItem(storageKey, JSON.stringify(collection));
    return newDraft;
  } catch {
    return null;
  }
}

export function deleteTicketCreateDraft(storageKey: string, draftId?: string) {
  if (!canUseLocalStorage()) return;

  try {
    if (!draftId) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    const collection = loadTicketCreateDraftsCollection(storageKey);
    if (!collection) return;

    collection.drafts = collection.drafts.filter(
      (draft) => draft.id !== draftId,
    );

    if (!collection.drafts.length) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(collection));
  } catch {
    // Storage errors should not block the ticket flow.
  }
}
