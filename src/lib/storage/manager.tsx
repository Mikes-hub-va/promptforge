"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createId } from "@/lib/utils/id";
import { clampText } from "@/lib/utils/string";
import { HistoryEntry, PromptOutput, PromptSettings, SavedPrompt } from "@/types";
import {
  getHistoryLocal,
  getSavedPromptsLocal,
  saveHistoryLocal,
  savePromptsLocal,
} from "./localStorage";

interface PromptForgeStoreContext {
  savedPrompts: SavedPrompt[];
  history: HistoryEntry[];
  addToSaved: (output: PromptOutput, settings: PromptSettings) => SavedPrompt;
  updateSaved: (id: string, next: Partial<SavedPrompt>) => void;
  deleteSaved: (id: string) => void;
  duplicateSaved: (id: string) => void;
  clearHistory: () => void;
  pushHistory: (entry: HistoryEntry) => void;
  replaceHistory: (entry: HistoryEntry[]) => void;
}

const PromptForgeStore = createContext<PromptForgeStoreContext | null>(null);

function newDraft(name: string, output: PromptOutput, settings: PromptSettings): SavedPrompt {
  return {
    id: output.id,
    source: "local",
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

export function PromptForgeStoreProvider({ children }: { children: ReactNode }) {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => getSavedPromptsLocal());
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistoryLocal());

  const addToSaved = useCallback((output: PromptOutput, settings: PromptSettings) => {
    const name = `${clampText(settings.goal || settings.rawPrompt, 56)} (forge)`;
    const draft = newDraft(name, output, settings);
    const next = [draft, ...savedPrompts.filter((item) => item.id !== draft.id)].slice(0, 100);
    savePromptsLocal(next);
    setSavedPrompts(next);
    return draft;
  }, [savedPrompts]);

  const updateSaved = useCallback((id: string, updates: Partial<SavedPrompt>) => {
    const next = savedPrompts.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item,
    );
    savePromptsLocal(next);
    setSavedPrompts(next);
  }, [savedPrompts]);

  const deleteSaved = useCallback((id: string) => {
    const next = savedPrompts.filter((item) => item.id !== id);
    savePromptsLocal(next);
    setSavedPrompts(next);
  }, [savedPrompts]);

  const duplicateSaved = useCallback((id: string) => {
    const source = savedPrompts.find((item) => item.id === id);
    if (!source) {
      return;
    }

    const copy: SavedPrompt = {
      ...source,
      id: createId("prompt"),
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [copy, ...savedPrompts].slice(0, 100);
    savePromptsLocal(next);
    setSavedPrompts(next);
  }, [savedPrompts]);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    const next = [entry, ...history].slice(0, 100);
    saveHistoryLocal(next);
    setHistory(next);
  }, [history]);

  const replaceHistory = useCallback((next: HistoryEntry[]) => {
    saveHistoryLocal(next);
    setHistory(next);
  }, []);

  const clearHistory = useCallback(() => {
    replaceHistory([]);
  }, [replaceHistory]);

  const value = useMemo(
    () => ({
      savedPrompts,
      history,
      addToSaved,
      updateSaved,
      deleteSaved,
      duplicateSaved,
      clearHistory,
      pushHistory,
      replaceHistory,
    }),
    [savedPrompts, history, addToSaved, updateSaved, deleteSaved, duplicateSaved, clearHistory, pushHistory, replaceHistory],
  );

  return <PromptForgeStore.Provider value={value}>{children}</PromptForgeStore.Provider>;
}

export function usePromptForgeStore() {
  const context = useContext(PromptForgeStore);
  if (!context) {
    throw new Error("usePromptForgeStore must be used within PromptForgeStoreProvider");
  }
  return context;
}
