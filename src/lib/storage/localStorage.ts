import { HistoryEntry, SavedPrompt } from "@/types";

const SAVED_KEY = "promptforge:saved-prompts-v1";
const HISTORY_KEY = "promptforge:history-v1";

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

  return safeParse(window.localStorage.getItem(SAVED_KEY), []);
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

  return safeParse(window.localStorage.getItem(HISTORY_KEY), []);
}

export function saveHistoryLocal(list: HistoryEntry[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
}
