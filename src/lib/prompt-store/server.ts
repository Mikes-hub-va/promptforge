import { getDatabase } from "@/lib/db";
import { HistoryEntry, PromptSettings, PromptOutput, SavedPrompt } from "@/types";
import { createId } from "@/lib/utils/id";

type SavedPromptRow = {
  id: string;
  source: string;
  name: string;
  created_at: string;
  updated_at: string;
  tags_json: string;
  is_starred: number;
  is_favorite: number;
  folder: string | null;
  settings_json: string;
  output_json: string;
};

type HistoryRow = {
  id: string;
  created_at: string;
  settings_json: string;
  output_json: string;
};

function safeParseJson<T>(raw: string, fallback: T) {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapSavedPrompt(row: SavedPromptRow): SavedPrompt {
  return {
    id: row.id,
    source: row.source === "local" ? "local" : "account",
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: safeParseJson<string[]>(row.tags_json, []),
    isStarred: Boolean(row.is_starred),
    isFavorite: Boolean(row.is_favorite),
    folder: row.folder ?? undefined,
    settings: safeParseJson<PromptSettings>(row.settings_json, {} as PromptSettings),
    output: safeParseJson<PromptOutput>(row.output_json, {} as PromptOutput),
  };
}

function mapHistoryEntry(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    settings: safeParseJson<PromptSettings>(row.settings_json, {} as PromptSettings),
    output: safeParseJson<PromptOutput>(row.output_json, {} as PromptOutput),
  };
}

function dedupeAndTrimHistory(entries: HistoryEntry[]) {
  const byId = new Map<string, HistoryEntry>();

  for (const entry of entries) {
    const current = byId.get(entry.id);
    if (!current || new Date(entry.createdAt).getTime() >= new Date(current.createdAt).getTime()) {
      byId.set(entry.id, entry);
    }
  }

  return Array.from(byId.values())
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 100);
}

export function listSavedPrompts(userId: string) {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT *
    FROM saved_prompts
    WHERE user_id = ?
    ORDER BY datetime(updated_at) DESC
    LIMIT 100
  `).all(userId) as SavedPromptRow[];

  return rows.map(mapSavedPrompt);
}

export function listHistoryEntries(userId: string) {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT *
    FROM history_entries
    WHERE user_id = ?
    ORDER BY datetime(created_at) DESC
    LIMIT 100
  `).all(userId) as HistoryRow[];

  return rows.map(mapHistoryEntry);
}

export function upsertSavedPrompt(userId: string, prompt: SavedPrompt) {
  const db = getDatabase();

  db.prepare(`
    INSERT INTO saved_prompts (
      id,
      user_id,
      source,
      name,
      created_at,
      updated_at,
      tags_json,
      is_starred,
      is_favorite,
      folder,
      settings_json,
      output_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, id) DO UPDATE SET
      name = excluded.name,
      updated_at = excluded.updated_at,
      tags_json = excluded.tags_json,
      is_starred = excluded.is_starred,
      is_favorite = excluded.is_favorite,
      folder = excluded.folder,
      settings_json = excluded.settings_json,
      output_json = excluded.output_json,
      source = excluded.source
  `).run(
    prompt.id,
    userId,
    "account",
    prompt.name,
    prompt.createdAt,
    prompt.updatedAt,
    JSON.stringify(prompt.tags),
    prompt.isStarred ? 1 : 0,
    prompt.isFavorite ? 1 : 0,
    prompt.folder ?? null,
    JSON.stringify(prompt.settings),
    JSON.stringify(prompt.output),
  );

  return listSavedPrompts(userId);
}

export function patchSavedPrompt(userId: string, promptId: string, updates: Partial<SavedPrompt>) {
  const current = listSavedPrompts(userId).find((item) => item.id === promptId);
  if (!current) {
    return listSavedPrompts(userId);
  }

  const next: SavedPrompt = {
    ...current,
    ...updates,
    source: "account",
    updatedAt: new Date().toISOString(),
  };

  return upsertSavedPrompt(userId, next);
}

export function removeSavedPrompt(userId: string, promptId: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM saved_prompts WHERE id = ? AND user_id = ?").run(promptId, userId);
  return listSavedPrompts(userId);
}

export function duplicateSavedPrompt(userId: string, promptId: string) {
  const source = listSavedPrompts(userId).find((item) => item.id === promptId);
  if (!source) {
    return listSavedPrompts(userId);
  }

  const now = new Date().toISOString();
  const duplicate: SavedPrompt = {
    ...source,
    id: createId("prompt"),
    source: "account",
    name: `${source.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  return upsertSavedPrompt(userId, duplicate);
}

export function addHistoryEntry(userId: string, entry: HistoryEntry) {
  const db = getDatabase();

  db.prepare(`
    INSERT INTO history_entries (
      id,
      user_id,
      created_at,
      settings_json,
      output_json
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, id) DO UPDATE SET
      created_at = excluded.created_at,
      settings_json = excluded.settings_json,
      output_json = excluded.output_json
  `).run(
    entry.id,
    userId,
    entry.createdAt,
    JSON.stringify(entry.settings),
    JSON.stringify(entry.output),
  );

  const rows = listHistoryEntries(userId);
  if (rows.length > 100) {
    const keepIds = new Set(rows.slice(0, 100).map((item) => item.id));
    db.prepare("DELETE FROM history_entries WHERE user_id = ?").run(userId);
    const insert = db.prepare(`
      INSERT INTO history_entries (id, user_id, created_at, settings_json, output_json)
      VALUES (?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((items: HistoryEntry[]) => {
      for (const item of items) {
        insert.run(item.id, userId, item.createdAt, JSON.stringify(item.settings), JSON.stringify(item.output));
      }
    });
    transaction(rows.filter((item) => keepIds.has(item.id)));
  }

  return listHistoryEntries(userId);
}

export function replaceHistoryEntries(userId: string, entries: HistoryEntry[]) {
  const db = getDatabase();
  db.prepare("DELETE FROM history_entries WHERE user_id = ?").run(userId);

  const insert = db.prepare(`
    INSERT INTO history_entries (id, user_id, created_at, settings_json, output_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  const transaction = db.transaction((items: HistoryEntry[]) => {
    for (const item of items.slice(0, 100)) {
      insert.run(item.id, userId, item.createdAt, JSON.stringify(item.settings), JSON.stringify(item.output));
    }
  });
  transaction(dedupeAndTrimHistory(entries));

  return listHistoryEntries(userId);
}

export function syncPromptStore(userId: string, payload: { savedPrompts: SavedPrompt[]; history: HistoryEntry[] }) {
  for (const prompt of payload.savedPrompts) {
    upsertSavedPrompt(userId, {
      ...prompt,
      source: "account",
    });
  }

  if (payload.history.length) {
    const existingHistory = listHistoryEntries(userId);
    replaceHistoryEntries(userId, [...payload.history, ...existingHistory]);
  }

  return {
    savedPrompts: listSavedPrompts(userId),
    history: listHistoryEntries(userId),
  };
}
