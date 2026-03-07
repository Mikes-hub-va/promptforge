"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  FolderHeart,
  History,
  Layers3,
  Rocket,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { HistoryEntry, SavedPrompt, TemplatePreset } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WorkspaceSidebarProps = {
  draftScore: number;
  tokenEstimate: number;
  missingFields: string[];
  strengths: string[];
  recommendedAction: string;
  providerSummary: string;
  compareSummary: string;
  draftRestored: boolean;
  activeTemplateTitle?: string;
  lastAutosavedAt?: string | null;
  quickPresets: TemplatePreset[];
  recentHistory: HistoryEntry[];
  recentSaved: SavedPrompt[];
  onUsePreset: (preset: TemplatePreset) => void;
  onRestoreHistory: (entry: HistoryEntry) => void;
  onOpenSaved: (prompt: SavedPrompt) => void;
  onClearDraft: () => void;
};

function formatRelativeLabel(value?: string | null) {
  if (!value) {
    return "Not yet";
  }

  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function truncate(value: string, max = 58) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function WorkspaceSidebar({
  draftScore,
  tokenEstimate,
  missingFields,
  strengths,
  recommendedAction,
  providerSummary,
  compareSummary,
  draftRestored,
  activeTemplateTitle,
  lastAutosavedAt,
  quickPresets,
  recentHistory,
  recentSaved,
  onUsePreset,
  onRestoreHistory,
  onOpenSaved,
  onClearDraft,
}: WorkspaceSidebarProps) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-sky-600" />
            Draft Intelligence
          </CardTitle>
          <CardDescription>Live feedback on the current brief before you spend a run.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] xl:grid-cols-1 2xl:grid-cols-[auto_1fr]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-teal-200/70 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.16),rgba(255,255,255,0.9))] shadow-[0_22px_46px_-28px_rgba(15,118,110,0.5)]">
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{draftScore}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">readiness</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">{recommendedAction}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">~{tokenEstimate} prompt tokens</Badge>
                <Badge variant="outline">{providerSummary}</Badge>
                <Badge variant="outline">{compareSummary}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {draftRestored ? <Badge className="bg-emerald-100 text-emerald-800">Recovered draft</Badge> : null}
                {activeTemplateTitle ? <Badge className="bg-sky-100 text-sky-800">Template: {activeTemplateTitle}</Badge> : null}
                <Badge variant="outline">Autosave {formatRelativeLabel(lastAutosavedAt)}</Badge>
              </div>
            </div>
          </div>

          {missingFields.length > 0 ? (
            <div className="rounded-[22px] border border-amber-200/70 bg-amber-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Best fields to add next</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-[22px] border border-emerald-200/70 bg-emerald-50/70 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">The brief is in strong shape.</p>
              <p className="mt-1">You have enough structure to generate a reliable prompt pack or run model comparisons with confidence.</p>
            </div>
          )}

          {strengths.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Working Well</p>
              <div className="flex flex-wrap gap-2">
                {strengths.map((strength) => (
                  <Badge key={strength} variant="outline" className="border-emerald-200 bg-emerald-50/70 text-emerald-900">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <Button type="button" variant="outline" onClick={onClearDraft} className="w-full justify-center">
            <Trash2 className="h-4 w-4" />
            Reset Workspace Draft
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-teal-600" />
            Quick Starts
          </CardTitle>
          <CardDescription>Template shortcuts tuned to the current use case.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onUsePreset(preset)}
              className="w-full rounded-[22px] border border-slate-200/80 bg-white/82 p-4 text-left transition hover:border-teal-200 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{preset.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{truncate(preset.description, 92)}</p>
                </div>
                <span className="text-lg leading-none">{preset.icon}</span>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Load into editor
                <ArrowUpRight className="h-3.5 w-3.5" />
              </p>
            </button>
          ))}

          <Button asChild variant="secondary" className="w-full justify-center">
            <Link href="/templates">
              <Rocket className="h-4 w-4" />
              Browse Full Template Library
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderHeart className="h-4 w-4 text-rose-500" />
            Recent Activity
          </CardTitle>
          <CardDescription>Jump back into the runs and saved prompts you were using.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent Runs</p>
              <Link href="/history" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                Open history
              </Link>
            </div>
            {recentHistory.length ? (
              <div className="space-y-2">
                {recentHistory.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onRestoreHistory(entry)}
                    className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/82 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{entry.settings.goal || truncate(entry.settings.rawPrompt, 40)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.settings.useCase} • {formatRelativeLabel(entry.createdAt)}
                      </p>
                    </div>
                    <History className="mt-0.5 h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Your generated prompt packs will appear here.</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Saved Prompts</p>
              <Link href="/saved" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                Open saved
              </Link>
            </div>
            {recentSaved.length ? (
              <div className="space-y-2">
                {recentSaved.map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => onOpenSaved(prompt)}
                    className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/82 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{truncate(prompt.name, 42)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {prompt.settings.useCase} • {formatRelativeLabel(prompt.updatedAt)}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Saved prompt packs will show up here for quick reopen.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
