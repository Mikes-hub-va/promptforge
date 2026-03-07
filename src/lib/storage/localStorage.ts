import { HistoryEntry, PromptSettings, SavedPrompt } from "@/types";

const SAVED_KEY = "promptify:saved-prompts-v2";
const HISTORY_KEY = "promptify:history-v2";
const DRAFT_KEY = "promptify:workspace-draft-v2";
const ACCOUNT_SYNC_KEY = "promptify:last-account-sync-v1";
const LEGACY_SAVED_KEY = "promptforge:saved-prompts-v1";
const LEGACY_HISTORY_KEY = "promptforge:history-v1";
const LEGACY_DRAFT_KEY = "promptforge:workspace-draft-v1";

type WorkspaceDraftRecord = {
  settings: PromptSettings;
  updatedAt: string;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSavedPromptsLocal(): SavedPrompt[] {
  if (typeof window === "undefined") {
    return [];
  }

  const primary = safeParse(window.localStorage.getItem(SAVED_KEY), [] as SavedPrompt[]);
  if (primary.length) {
    return primary;
  }

  return safeParse(window.localStorage.getItem(LEGACY_SAVED_KEY), []);
}

export function savePromptsLocal(list: SavedPrompt[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  }
}

export function getHistoryLocal(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const primary = safeParse(window.localStorage.getItem(HISTORY_KEY), [] as HistoryEntry[]);
  if (primary.length) {
    return primary;
  }

  return safeParse(window.localStorage.getItem(LEGACY_HISTORY_KEY), []);
}

export function saveHistoryLocal(list: HistoryEntry[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
}

export function getWorkspaceDraftLocal(): WorkspaceDraftRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const primary = safeParse<WorkspaceDraftRecord | null>(window.localStorage.getItem(DRAFT_KEY), null);
  if (primary) {
    return primary;
  }

  return safeParse<WorkspaceDraftRecord | null>(window.localStorage.getItem(LEGACY_DRAFT_KEY), null);
}

export function saveWorkspaceDraftLocal(settings: PromptSettings) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        settings,
        updatedAt: new Date().toISOString(),
      } satisfies WorkspaceDraftRecord),
    );
  }
}

export function clearWorkspaceDraftLocal() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DRAFT_KEY);
  }
}

export function getLastSyncedAccountId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ACCOUNT_SYNC_KEY) ?? "";
}

export function setLastSyncedAccountId(userId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCOUNT_SYNC_KEY, userId);
  }
}
