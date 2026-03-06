"use client";

import Link from "next/link";
import { HistoryEntry } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HistoryList({ entries, onRestore }: { entries: HistoryEntry[]; onRestore: (entry: HistoryEntry) => void }) {
  if (!entries.length) {
    return <p className="text-sm text-slate-500">Your recent generations will appear here.</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <CardTitle className="text-base">{entry.settings.useCase} • {new Date(entry.createdAt).toLocaleString()}</CardTitle>
            <CardDescription className="text-xs">{entry.settings.goal || entry.settings.rawPrompt.slice(0, 60)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => onRestore(entry)}>
              Restore in workspace
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/saved">Open Saved</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
