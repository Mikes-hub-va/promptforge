"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePromptifyStore } from "@/lib/storage/manager";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/workspace/empty-state";
import { HistoryList } from "@/components/workspace/history-list";
import { Input } from "@/components/ui/input";

export function HistoryPageClient() {
  const { history, storageMode, replaceHistory } = usePromptifyStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((entry) =>
      `${entry.settings.goal} ${entry.settings.useCase} ${entry.settings.rawPrompt}`.toLowerCase().includes(q),
    );
  }, [history, query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Prompt History</h1>
          <p className="mt-2 text-sm text-slate-600">
            {storageMode === "account"
              ? "Recent generations sync to your account for quick reuse."
              : "Recent generations stay in guest-mode browser storage for quick reuse."}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => replaceHistory([])}>
          Clear history
        </Button>
      </div>

      <div className="mb-6 max-w-md">
        <Input placeholder="Search history" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {!filtered.length ? (
        <EmptyState
          title="No history yet"
          text="Generated prompts appear here so you can restore prior versions quickly."
          action={
            <Link href="/workspace" className="text-sm underline">
              Go to workspace
            </Link>
          }
        />
      ) : (
        <HistoryList
          entries={filtered}
          onRestore={(entry) => {
            window.location.href = `/workspace?restore=${entry.id}`;
          }}
        />
      )}
    </div>
  );
}
