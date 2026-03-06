import { HistoryEntry, SavedPrompt } from "@/types";

export interface SavedPromptStorage {
  getSavedPrompts(): Promise<SavedPrompt[]>;
  savePrompt(prompt: SavedPrompt): Promise<SavedPrompt[]>;
  updatePrompt(id: string, updates: Partial<SavedPrompt>): Promise<SavedPrompt[]>;
  deletePrompt(id: string): Promise<SavedPrompt[]>;
  getHistory(): Promise<HistoryEntry[]>;
  addHistory(entry: HistoryEntry): Promise<HistoryEntry[]>;
  clearHistory(): Promise<HistoryEntry[]>;
}
