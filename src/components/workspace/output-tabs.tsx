"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCopy,
  Clock3,
  FileStack,
  Gauge,
  Save,
  TextSearch,
  WandSparkles,
} from "lucide-react";
import { PromptComparisonOutput, PromptDiffPoint, PromptOutput } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

function variantIdForLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OutputTabs({
  output,
  diff,
  runMode,
  runLabel,
  generatedAt,
  isStale,
  onCopy,
  onCopySystem,
  onCopyUser,
  onCopyDeveloper,
  onCopyPackage,
  onSave,
  onExport,
  onCompare,
  comparisons,
}: {
  output: PromptOutput;
  diff?: PromptDiffPoint[];
  runMode?: string | null;
  runLabel?: string | null;
  generatedAt?: string | null;
  isStale?: boolean;
  onCopy: (content: string) => void;
  onCopySystem: (content: string) => void;
  onCopyUser: (content: string) => void;
  onCopyDeveloper: (content: string) => void;
  onCopyPackage: (output: PromptOutput, currentText: string) => void;
  onSave: (output: PromptOutput) => void;
  onExport: (content: string, format: "txt" | "md") => void;
  onCompare: () => void;
  comparisons?: PromptComparisonOutput[];
}) {
  const baseVariantItems = useMemo(
    () => output.variants.map((variant) => ({ id: variantIdForLabel(variant.label), label: variant.label })),
    [output.variants],
  );

  const comparisonItems = useMemo(
    () =>
      (comparisons ?? [])
        .filter((comparison) => Boolean(comparison.output?.basePrompt))
        .map((comparison) => ({
          id: `compare-${comparison.model}`,
          label: `Compare: ${comparison.model}`,
          output: comparison.output,
          cost: comparison.costEstimateUsd,
        })),
    [comparisons],
  );

  const items = useMemo(
    () => [
      ...baseVariantItems,
      ...comparisonItems.map((comparison) => ({
        id: comparison.id,
        label: comparison.label,
      })),
    ],
    [baseVariantItems, comparisonItems],
  );

  const defaultActive = useMemo(
    () => baseVariantItems.find((item) => item.id === "improved")?.id ?? baseVariantItems[0]?.id ?? "improved",
    [baseVariantItems],
  );

  const [active, setActive] = useState(defaultActive);

  const activePrompt = output.variants.find((variant) => variantIdForLabel(variant.label) === active);
  const comparisonMatch = comparisonItems.find((comparison) => comparison.id === active);
  const activePackageOutput = comparisonMatch?.output ?? output;
  const currentText = comparisonMatch
    ? activePackageOutput.basePrompt ?? output.basePrompt
    : activePrompt?.prompt ?? activePackageOutput.basePrompt;
  const activeComparisonCost = comparisonMatch?.cost;
  const currentRationale = comparisonMatch
    ? activePackageOutput.rationaleSummary.length
      ? activePackageOutput.rationaleSummary
      : activePackageOutput.qualityFlags ?? ["Comparison output ready for inspection."]
    : activePrompt?.rationale ?? [];

  const qualityScore = Math.max(0, Math.min(100, Math.round(activePackageOutput.qualityScore ?? 0)));
  const hasComparisons = comparisonItems.length > 0;
  const activeModel = active.startsWith("compare-") ? active.replace("compare-", "") : undefined;
  const visibleDiff = comparisonMatch ? [] : diff ?? [];

  const packageSections = [
    { label: "Structured", value: activePackageOutput.structuredPrompt },
    { label: "System", value: activePackageOutput.systemPrompt },
    { label: "User", value: activePackageOutput.userPrompt },
    { label: "Developer", value: activePackageOutput.developerPrompt ?? "" },
  ].filter((section) => Boolean(section.value.trim()));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Forged Prompt</CardTitle>
            <p className="mt-1 text-sm text-slate-600">Inspect the active prompt package, copy the right layer, and keep the run explainable.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/70 px-3 py-1 text-xs text-slate-700">
                <Gauge className="h-3.5 w-3.5 text-emerald-600" />
                {activeModel ? `Model comparison score ${qualityScore}/100` : `Prompt confidence ${qualityScore}/100`}
              </p>
              {runLabel ? <Badge variant="outline">{runLabel}</Badge> : null}
              {runMode === "heuristic_fallback" ? <Badge className="bg-amber-100 text-amber-900">Fallback used</Badge> : null}
              {isStale ? <Badge className="bg-rose-100 text-rose-900">Needs refresh</Badge> : null}
            </div>
            {activeComparisonCost != null ? (
              <p className="mt-2 text-xs text-slate-500">
                Estimated model cost:{" "}
                {Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 3 }).format(
                  activeComparisonCost,
                )}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onSave(activePackageOutput)}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCopy(currentText)}>
              <ClipboardCopy className="h-4 w-4" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCopyPackage(activePackageOutput, currentText)}>
              <FileStack className="h-4 w-4" />
              Copy pack
            </Button>
            <Button size="sm" variant="outline" onClick={() => onExport(currentText, "md")}>
              <WandSparkles className="h-4 w-4" />
              Export .md
            </Button>
            <Button size="sm" variant="outline" onClick={() => onExport(currentText, "txt")}>
              <WandSparkles className="h-4 w-4" />
              Export .txt
            </Button>
            <Button size="sm" onClick={onCompare}>
              <TextSearch className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs items={items} activeId={active} onSelect={setActive} />

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/78 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Run Status</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                {formatTimestamp(generatedAt ?? activePackageOutput.createdAt)}
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Runtime</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{runLabel ?? "Restored output package"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Compare Surface</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {hasComparisons ? `${comparisonItems.length} extra model tabs ready` : "Single model result"}
                </p>
              </div>
            </div>

            {isStale ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                The form changed after this run. Forge again to refresh the package.
              </p>
            ) : null}

            {hasComparisons ? (
              <p className="mt-3 text-xs text-slate-500">
                Compare tabs hold provider-specific output packages. Save or copy from the active tab when you want that exact framing.
              </p>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/78 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Prompt Package Layers</p>
              <Badge variant="outline">{packageSections.length} sections</Badge>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {packageSections.map((section) => (
                <div key={section.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{section.label}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (section.label === "System") {
                          onCopySystem(section.value);
                          return;
                        }
                        if (section.label === "User") {
                          onCopyUser(section.value);
                          return;
                        }
                        if (section.label === "Developer") {
                          onCopyDeveloper(section.value);
                          return;
                        }
                        onCopy(section.value);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {Math.max(1, Math.ceil(section.value.length / 4))} tokens estimated
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {output.rationaleSummary.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/75 p-3 text-sm text-slate-700">
            <p className="mb-2 font-semibold text-slate-900">What Improved</p>
            <ul className="list-inside list-disc space-y-1 text-slate-600">
              {output.rationaleSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {visibleDiff.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/75 p-3 text-sm text-slate-700">
            <p className="mb-3 font-semibold text-slate-900">Change Map</p>
            <div className="grid gap-2 md:grid-cols-2">
              {visibleDiff.map((item) => (
                <div key={`${item.label}-${item.note}`} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activePackageOutput.qualityFlags && activePackageOutput.qualityFlags.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/75 p-3 text-sm text-slate-700">
            <p className="mb-2 text-sm font-semibold text-slate-900">Engine Notes</p>
            <ul className="list-inside list-disc space-y-1 text-slate-600">
              {activePackageOutput.qualityFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {currentRationale.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/75 p-3 text-sm text-slate-700">
            <p className="mb-2 text-sm font-semibold text-slate-900">Variant Rationale</p>
            <ul className="list-inside list-disc space-y-1">
              {currentRationale.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <pre className="mt-4 max-h-[26rem] overflow-auto rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,248,250,0.88))] p-4 text-sm leading-6 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {currentText}
        </pre>
      </CardContent>
    </Card>
  );
}
