"use client";

import { useMemo, useState } from "react";
import { usePromptifyStore } from "@/lib/storage/manager";
import { EmptyState } from "@/components/workspace/empty-state";
import { SavedPromptCard } from "@/components/workspace/saved-prompt-card";
import { trackEvent } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SavedPromptsPageClient() {
  const { savedPrompts, storageMode, updateSaved, duplicateSaved, deleteSaved } = usePromptifyStore();
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [recentCutoff] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);

  const scopeOptions = useMemo<string[]>(() => {
    const folders = savedPrompts
      .map((item) => item.folder)
      .filter((item): item is string => Boolean(item));
    const merged = ["all", "favorites", "recent", ...folders];
    return [...new Set(merged)];
  }, [savedPrompts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return savedPrompts.filter((prompt) => {
      const inScope =
        scope === "all"
          ? true
          : scope === "favorites"
            ? prompt.isFavorite
            : scope === "recent"
              ? new Date(prompt.createdAt).getTime() > recentCutoff
              : !prompt.folder || prompt.folder === scope;

      const inText = [prompt.name, prompt.output.basePrompt, prompt.settings.useCase]
        .join(" ")
        .toLowerCase()
        .includes(q);

      return inScope && (!q || inText);
    });
  }, [search, savedPrompts, scope, recentCutoff]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-semibold">Saved Prompts</h1>
      <p className="mt-2 text-sm text-slate-600">
        {storageMode === "account"
          ? "Keep polished prompts synced to your account with folders, favorites, and quick reopen."
          : "Keep polished prompts in guest mode with folders, favorites, and quick reopen."}
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder="Search saved prompts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={scope === option ? "default" : "outline"}
              onClick={() => setScope(option)}
              type="button"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className="mt-8">
          <EmptyState title="No saved prompts yet" text="Save a prompt from the workspace to create your first item." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((prompt) => (
            <SavedPromptCard
              key={prompt.id}
              prompt={prompt}
              onOpen={() => {
                window.location.href = `/workspace?restore=${prompt.id}`;
                trackEvent("prompt_saved", { action: "open" });
              }}
              onRename={(name) => {
                updateSaved(prompt.id, { name });
                trackEvent("prompt_saved", { action: "rename" });
              }}
              onDuplicate={() => {
                duplicateSaved(prompt.id);
                trackEvent("prompt_saved", { action: "duplicate" });
              }}
              onDelete={() => {
                deleteSaved(prompt.id);
              }}
              onCopy={() => {
                navigator.clipboard.writeText(prompt.output.basePrompt);
                trackEvent("prompt_copied", { id: prompt.id });
              }}
              onToggleStar={() => {
                updateSaved(prompt.id, { isFavorite: !prompt.isFavorite });
                trackEvent("prompt_saved", { action: "favorite" });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
