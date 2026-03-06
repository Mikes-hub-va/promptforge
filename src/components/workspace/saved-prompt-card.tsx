"use client";

import { useState } from "react";
import { Star, Copy, Download, Ellipsis, Pencil } from "lucide-react";
import { SavedPrompt } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SavedPromptCard({
  prompt,
  onDuplicate,
  onRename,
  onDelete,
  onCopy,
  onToggleStar,
}: {
  prompt: SavedPrompt;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onCopy: () => void;
  onToggleStar: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(prompt.name);

  const saveName = () => {
    if (title.trim() && title !== prompt.name) {
      onRename(title.trim());
    }
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {editing ? (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={saveName}
              className="max-w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveName();
                }
              }}
              aria-label="Edit saved prompt title"
            />
          ) : (
            <CardTitle>{prompt.name}</CardTitle>
          )}
          <button type="button" onClick={onToggleStar} aria-label="toggle favorite" className="text-slate-500">
            <Star className={`h-5 w-5 ${prompt.isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>
        </div>
        <CardDescription className="text-xs">{prompt.updatedAt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="outline">{prompt.settings.useCase}</Badge>
        <p className="text-sm text-slate-700">{prompt.output.basePrompt.slice(0, 150)}...</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onCopy}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Rename
          </Button>
          <Button size="sm" variant="outline" onClick={onDuplicate}>
            <Download className="h-4 w-4" /> Duplicate
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Ellipsis className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
