"use client";

import { usePromptForgeStore } from "@/lib/storage/manager";
import { EmptyState } from "@/components/workspace/empty-state";
import { SavedPromptCard } from "@/components/workspace/saved-prompt-card";
import { trackEvent } from "@/lib/analytics";

export default function SavedPromptsPage() {
  const { savedPrompts, updateSaved, duplicateSaved, deleteSaved } = usePromptForgeStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-semibold">Saved Prompts</h1>
      <p className="mt-2 text-sm text-slate-600">Keep polished prompts in folders, favorites, and history-safe drafts.</p>

      {!savedPrompts.length ? (
        <div className="mt-8">
          <EmptyState title="No saved prompts yet" text="Save a prompt from the workspace to create your first item." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedPrompts.map((prompt) => (
            <SavedPromptCard
              key={prompt.id}
              prompt={prompt}
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
