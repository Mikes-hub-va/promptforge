"use client";

import Link from "next/link";
import { usePromptForgeStore } from "@/lib/storage/manager";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/workspace/empty-state";
import { HistoryList } from "@/components/workspace/history-list";

export default function HistoryPage() {
  const { history, replaceHistory } = usePromptForgeStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Prompt History</h1>
          <p className="mt-2 text-sm text-slate-600">Recent generations are saved locally for quick reuse.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => replaceHistory([])}>
          Clear history
        </Button>
      </div>

      {!history.length ? (
        <EmptyState
          title="No history yet"
          text="Generated prompts appear here so you can restore prior versions quickly."
          action={<Link href="/workspace" className="text-sm underline">Go to workspace</Link>}
        />
      ) : (
        <HistoryList
          entries={history}
          onRestore={(entry) => {
            window.location.href = `/workspace?restore=${entry.id}`;
          }}
        />
      )}
    </div>
  );
}
