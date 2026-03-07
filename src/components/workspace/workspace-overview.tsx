"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  FolderClock,
  History,
  Layers3,
  LibraryBig,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type WorkspaceOverviewProps = {
  draftScore: number;
  savedCount: number;
  historyCount: number;
  compareCount: number;
  storageMode: "local" | "account";
  runtimeLabel: string;
  activeTemplateTitle?: string;
  lastAutosavedAt?: string | null;
  isDirty: boolean;
  onApplyPreset: () => void;
  onClearDraft: () => void;
};

function formatAutosaveLabel(value?: string | null) {
  if (!value) {
    return "Autosave idle";
  }

  const target = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - target) / 60_000));

  if (diffMinutes < 1) {
    return "Autosaved just now";
  }

  if (diffMinutes < 60) {
    return `Autosaved ${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `Autosaved ${diffHours}h ago`;
}

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

function StatTile({ label, value, detail, icon }: StatTileProps) {
  return (
    <div className="pf-soft-panel rounded-[24px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.4)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceOverview({
  draftScore,
  savedCount,
  historyCount,
  compareCount,
  storageMode,
  runtimeLabel,
  activeTemplateTitle,
  lastAutosavedAt,
  isDirty,
  onApplyPreset,
  onClearDraft,
}: WorkspaceOverviewProps) {
  return (
    <Card className="pf-noise overflow-hidden rounded-[32px] border border-white/80">
      <CardContent className="relative overflow-hidden px-6 py-6 md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.1),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.84),rgba(248,250,252,0.72))]" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-5">
            <Badge className="border-white/70 bg-white/86 text-slate-800">Workspace Dashboard</Badge>

            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-[2.9rem]">
                Forge prompts like an operator, not a note taker.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Build structured prompt packages, compare model framing, recover work instantly, and keep your best prompts within reach from one control surface.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={onApplyPreset}>
                <Wand2 className="h-4 w-4" />
                Load Recommended Template
              </Button>
              <Button type="button" variant="outline" onClick={onClearDraft}>
                <Trash2 className="h-4 w-4" />
                Clear Draft
              </Button>
              <Button asChild variant="secondary">
                <Link href="/saved">
                  <LibraryBig className="h-4 w-4" />
                  View Saved
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/history">
                  <History className="h-4 w-4" />
                  Open History
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/80 bg-white/80">
                <Sparkles className="mr-1 h-3.5 w-3.5 text-teal-600" />
                {runtimeLabel}
              </Badge>
              {activeTemplateTitle ? (
                <Badge variant="outline" className="border-white/80 bg-white/80">
                  Active template: {activeTemplateTitle}
                </Badge>
              ) : null}
              <Badge variant="outline" className="border-white/80 bg-white/80">
                {formatAutosaveLabel(lastAutosavedAt)}
              </Badge>
              <Badge variant="outline" className="border-white/80 bg-white/80">
                {isDirty
                  ? "Draft editing live"
                  : storageMode === "account"
                    ? "Account sync live"
                    : "Guest mode local"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile
              label="Draft Readiness"
              value={`${draftScore}/100`}
              detail="Live score based on clarity, context, structure, and constraints."
              icon={<Layers3 className="h-5 w-5 text-sky-600" />}
            />
            <StatTile
              label="Saved Library"
              value={savedCount.toString()}
              detail="Reusable prompt packs sitting one click away."
              icon={<LibraryBig className="h-5 w-5 text-emerald-600" />}
            />
            <StatTile
              label="Recent Runs"
              value={historyCount.toString()}
              detail={storageMode === "account"
                ? "Account history you can restore across sessions."
                : "Guest-mode history you can restore into the editor."}
              icon={<FolderClock className="h-5 w-5 text-amber-600" />}
            />
            <StatTile
              label="Compare Slots"
              value={compareCount.toString()}
              detail="Additional model tabs armed for the next forge."
              icon={<Sparkles className="h-5 w-5 text-teal-600" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
