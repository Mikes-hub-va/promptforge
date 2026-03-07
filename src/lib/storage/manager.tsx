"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createId } from "@/lib/utils/id";
import { clampText } from "@/lib/utils/string";
import { HistoryEntry, PromptOutput, PromptSettings, SavedPrompt } from "@/types";
import { useAuth } from "@/lib/auth/client";
import {
  getHistoryLocal,
  getLastSyncedAccountId,
  getSavedPromptsLocal,
  saveHistoryLocal,
  savePromptsLocal,
  setLastSyncedAccountId,
} from "./localStorage";

interface PromptifyStoreContext {
  savedPrompts: SavedPrompt[];
  history: HistoryEntry[];
  storageMode: "local" | "account";
  addToSaved: (output: PromptOutput, settings: PromptSettings) => Promise<SavedPrompt>;
  updateSaved: (id: string, next: Partial<SavedPrompt>) => Promise<void>;
  deleteSaved: (id: string) => Promise<void>;
  duplicateSaved: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  pushHistory: (entry: HistoryEntry) => Promise<void>;
  replaceHistory: (entry: HistoryEntry[]) => Promise<void>;
}

const PromptifyStore = createContext<PromptifyStoreContext | null>(null);

function newDraft(name: string, output: PromptOutput, settings: PromptSettings, source: SavedPrompt["source"]): SavedPrompt {
  return {
    id: output.id,
    source,
    name,
    createdAt: output.createdAt,
    updatedAt: output.createdAt,
    settings,
    output,
    tags: [settings.useCase],
    isStarred: false,
    isFavorite: false,
    folder: settings.useCase,
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Request failed.");
  }
  return payload as T;
}

export function PromptifyStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [storageMode, setStorageMode] = useState<"local" | "account">("local");

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const localSaved = getSavedPromptsLocal();
      const localHistory = getHistoryLocal();

      if (!user) {
        if (!cancelled) {
          setStorageMode("local");
          setSavedPrompts(localSaved);
          setHistory(localHistory);
        }
        return;
      }

      try {
        const payload = await readResponse<{ savedPrompts: SavedPrompt[]; history: HistoryEntry[] }>(
          await fetch("/api/prompt-store", {
            cache: "no-store",
            credentials: "include",
          }),
        );

        let nextSaved = payload.savedPrompts;
        let nextHistory = payload.history;
        const shouldSyncLocal =
          (localSaved.length > 0 || localHistory.length > 0) &&
          !payload.savedPrompts.length &&
          !payload.history.length &&
          getLastSyncedAccountId() !== user.id;

        if (shouldSyncLocal) {
          const synced = await readResponse<{ savedPrompts: SavedPrompt[]; history: HistoryEntry[] }>(
            await fetch("/api/prompt-store/sync", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                savedPrompts: localSaved,
                history: localHistory,
              }),
            }),
          );
          nextSaved = synced.savedPrompts;
          nextHistory = synced.history;
          setLastSyncedAccountId(user.id);
        }

        if (!cancelled) {
          setStorageMode("account");
          setSavedPrompts(nextSaved);
          setHistory(nextHistory);
        }
      } catch (error) {
        console.warn("Account storage unavailable; falling back to local storage.", error);
        if (!cancelled) {
          setStorageMode("local");
          setSavedPrompts(localSaved);
          setHistory(localHistory);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToSaved = useCallback(async (output: PromptOutput, settings: PromptSettings) => {
    const name = `${clampText(settings.goal || settings.rawPrompt, 56)} (forge)`;
    const draft = newDraft(name, output, settings, user ? "account" : "local");
    const next = [draft, ...savedPrompts.filter((item) => item.id !== draft.id)].slice(0, 100);
    setSavedPrompts(next);
    if (!user || storageMode === "local") {
      savePromptsLocal(next);
      return draft;
    }

    try {
      const payload = await readResponse<{ savedPrompts: SavedPrompt[] }>(
        await fetch("/api/prompt-store/saved", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        }),
      );
      setSavedPrompts(payload.savedPrompts);
    } catch (error) {
      console.warn("Failed to save prompt to account storage.", error);
    }
    return draft;
  }, [savedPrompts, storageMode, user]);

  const updateSaved = useCallback(async (id: string, updates: Partial<SavedPrompt>) => {
    const next = savedPrompts.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item,
    );
    setSavedPrompts(next);
    if (!user || storageMode === "local") {
      savePromptsLocal(next);
      return;
    }

    try {
      const payload = await readResponse<{ savedPrompts: SavedPrompt[] }>(
        await fetch(`/api/prompt-store/saved/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }),
      );
      setSavedPrompts(payload.savedPrompts);
    } catch (error) {
      console.warn("Failed to update saved prompt.", error);
    }
  }, [savedPrompts, storageMode, user]);

  const deleteSaved = useCallback(async (id: string) => {
    const next = savedPrompts.filter((item) => item.id !== id);
    setSavedPrompts(next);
    if (!user || storageMode === "local") {
      savePromptsLocal(next);
      return;
    }

    try {
      const payload = await readResponse<{ savedPrompts: SavedPrompt[] }>(
        await fetch(`/api/prompt-store/saved/${id}`, {
          method: "DELETE",
          credentials: "include",
        }),
      );
      setSavedPrompts(payload.savedPrompts);
    } catch (error) {
      console.warn("Failed to delete saved prompt.", error);
    }
  }, [savedPrompts, storageMode, user]);

  const duplicateSaved = useCallback(async (id: string) => {
    const source = savedPrompts.find((item) => item.id === id);
    if (!source) {
      return;
    }

    const copy: SavedPrompt = {
      ...source,
      id: createId("prompt"),
      source: user ? "account" : "local",
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [copy, ...savedPrompts].slice(0, 100);
    setSavedPrompts(next);
    if (!user || storageMode === "local") {
      savePromptsLocal(next);
      return;
    }

    try {
      const payload = await readResponse<{ savedPrompts: SavedPrompt[] }>(
        await fetch(`/api/prompt-store/saved/${id}/duplicate`, {
          method: "POST",
          credentials: "include",
        }),
      );
      setSavedPrompts(payload.savedPrompts);
    } catch (error) {
      console.warn("Failed to duplicate saved prompt.", error);
    }
  }, [savedPrompts, storageMode, user]);

  const pushHistory = useCallback(async (entry: HistoryEntry) => {
    const next = [entry, ...history].slice(0, 100);
    setHistory(next);
    if (!user || storageMode === "local") {
      saveHistoryLocal(next);
      return;
    }

    try {
      const payload = await readResponse<{ history: HistoryEntry[] }>(
        await fetch("/api/prompt-store/history", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        }),
      );
      setHistory(payload.history);
    } catch (error) {
      console.warn("Failed to append history entry.", error);
    }
  }, [history, storageMode, user]);

  const replaceHistory = useCallback(async (next: HistoryEntry[]) => {
    setHistory(next);
    if (!user || storageMode === "local") {
      saveHistoryLocal(next);
      return;
    }

    try {
      const payload = await readResponse<{ history: HistoryEntry[] }>(
        await fetch("/api/prompt-store/history", {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entries: next }),
        }),
      );
      setHistory(payload.history);
    } catch (error) {
      console.warn("Failed to replace history.", error);
    }
  }, [storageMode, user]);

  const clearHistory = useCallback(async () => {
    await replaceHistory([]);
  }, [replaceHistory]);

  const value = useMemo(
    () => ({
      savedPrompts,
      history,
      storageMode,
      addToSaved,
      updateSaved,
      deleteSaved,
      duplicateSaved,
      clearHistory,
      pushHistory,
      replaceHistory,
    }),
    [savedPrompts, history, storageMode, addToSaved, updateSaved, deleteSaved, duplicateSaved, clearHistory, pushHistory, replaceHistory],
  );

  return <PromptifyStore.Provider value={value}>{children}</PromptifyStore.Provider>;
}

export function usePromptifyStore() {
  const context = useContext(PromptifyStore);
  if (!context) {
    throw new Error("usePromptifyStore must be used within PromptifyStoreProvider");
  }
  return context;
}
