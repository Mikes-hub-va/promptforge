"use client";

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PromptControlValues, PromptControls } from "./prompt-controls";
import { CompareView } from "./compare-view";
import { OutputTabs } from "./output-tabs";
import { EmptyState } from "./empty-state";
import { ProviderControls } from "./provider-controls";
import { WorkspaceOverview } from "./workspace-overview";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePromptifyStore } from "@/lib/storage/manager";
import { PromptComparisonOutput, PromptDiffPoint, PromptOutput, PromptSettings, SavedPrompt, TemplatePreset } from "@/types";
import { PRESET_LIBRARY, PRESET_SLUG_MAP } from "@/data/presets";
import { PROVIDER_MODELS } from "@/data/constants";
import { createHeuristicEngineDefaults, refinePrompt } from "@/lib/prompt-engine/factory";
import { ProviderRuntimeConfig } from "@/lib/prompt-engine/types";
import { trackEvent } from "@/lib/analytics";
import { createId } from "@/lib/utils/id";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  clearWorkspaceDraftLocal,
  getWorkspaceDraftLocal,
  saveWorkspaceDraftLocal,
} from "@/lib/storage/localStorage";

const schema = z.object({
  id: z.string().default(createId("settings")),
  rawPrompt: z.string().default(""),
  goal: z.string().default(""),
  targetModel: z.string().default("chatgpt"),
  useCase: z.enum([
    "writing",
    "coding",
    "marketing",
    "research",
    "business",
    "design",
    "images",
    "video",
    "agents",
    "productivity",
  ]),
  tone: z.enum(["neutral", "professional", "friendly", "authoritative", "creative", "minimal", "sales", "technical"]),
  outputFormat: z.enum(["plain", "bullet", "markdown", "json", "table", "steps"]),
  detailLevel: z.enum(["concise", "balanced", "detailed"]),
  includeContext: z.boolean().default(true),
  context: z.string().default(""),
  audience: z.string().default(""),
  includeConstraints: z.boolean().default(true),
  constraints: z.string().default("Avoid unsafe or misleading instructions."),
  includeExamples: z.boolean().default(false),
  examples: z.string().default(""),
  desiredStructure: z.string().default("objective -> context -> constraints -> steps -> output"),
  templateId: z.string().optional(),
});

type FormData = z.input<typeof schema>;

const defaultProviderConfig: ProviderRuntimeConfig = {
  provider: "local",
  model: PROVIDER_MODELS.local[0],
  apiKey: "",
  baseUrl: "",
};

function normalizePromptSettings(raw: Partial<FormData>, overrides: Partial<PromptSettings> = {}): PromptSettings {
  const defaults = createHeuristicEngineDefaults();
  const merged = {
    ...defaults,
    ...raw,
    ...overrides,
  };

  return {
    id: merged.id ?? defaults.id,
    rawPrompt: (merged.rawPrompt ?? "").trim(),
    goal: (merged.goal ?? "").trim(),
    targetModel: merged.targetModel ?? defaults.targetModel,
    useCase: merged.useCase ?? defaults.useCase,
    tone: merged.tone ?? defaults.tone,
    outputFormat: merged.outputFormat ?? defaults.outputFormat,
    detailLevel: merged.detailLevel ?? defaults.detailLevel,
    includeContext: merged.includeContext ?? defaults.includeContext,
    context: (merged.context ?? "").trim(),
    audience: (merged.audience ?? "").trim(),
    includeConstraints: merged.includeConstraints ?? defaults.includeConstraints,
    constraints: (merged.constraints ?? "").trim(),
    includeExamples: merged.includeExamples ?? defaults.includeExamples,
    examples: (merged.examples ?? "").trim(),
    desiredStructure: (merged.desiredStructure ?? "").trim(),
    templateId: merged.templateId,
  };
}

function formValuesForPreset(preset: TemplatePreset): FormData {
  return normalizePromptSettings({
    ...createHeuristicEngineDefaults(),
    ...preset.defaultSettings,
    rawPrompt: preset.exampleInputs.rawPrompt,
    goal: preset.exampleInputs.goal,
    audience: preset.exampleInputs.audience ?? "",
    context: preset.exampleInputs.context ?? "",
    constraints: preset.exampleInputs.constraints ?? "",
    includeContext: preset.recommendedFields.hasContext ?? true,
    includeConstraints: preset.recommendedFields.hasConstraints ?? true,
    includeExamples: preset.recommendedFields.hasExamples ?? false,
    templateId: preset.id,
  }) as FormData;
}

function estimateTokenCount(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  return Math.max(1, Math.ceil(normalized.length / 4));
}

function createSettingsSignature(settings: PromptSettings) {
  const { id: ignoredId, ...stable } = settings;
  void ignoredId;
  return JSON.stringify(stable);
}

function buildPromptPack(output: PromptOutput, currentText: string) {
  const sections = [
    ["Active Prompt", currentText],
    ["Structured Prompt", output.structuredPrompt],
    ["System Prompt", output.systemPrompt],
    ["User Prompt", output.userPrompt],
    ["Developer Prompt", output.developerPrompt ?? ""],
  ].filter(([, value]) => Boolean(value.trim()));

  return sections.map(([label, value]) => `# ${label}\n${value}`.trim()).join("\n\n");
}

function buildDraftInsights(settings: PromptSettings, compareCount: number) {
  const checks = [
    { label: "Raw prompt", ready: Boolean(settings.rawPrompt), weight: 30 },
    { label: "Goal", ready: Boolean(settings.goal), weight: 20 },
    { label: "Audience", ready: Boolean(settings.audience), weight: 10 },
    { label: "Context", ready: settings.includeContext ? Boolean(settings.context) : true, weight: 12 },
    { label: "Constraints", ready: settings.includeConstraints ? Boolean(settings.constraints) : true, weight: 16 },
    { label: "Examples", ready: settings.includeExamples ? Boolean(settings.examples) : true, weight: 5 },
    { label: "Structure", ready: Boolean(settings.desiredStructure), weight: 7 },
  ];

  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
  const currentScore = checks.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  const score = Math.round((currentScore / maxScore) * 100);

  const strengths = [
    settings.goal ? "Outcome is explicit" : "",
    settings.audience ? "Audience is defined" : "",
    settings.includeConstraints && settings.constraints ? "Constraints are testable" : "",
    settings.includeContext && settings.context ? "Context is grounded" : "",
    settings.includeExamples && settings.examples ? "Examples reduce ambiguity" : "",
    settings.desiredStructure ? "Output shape is specified" : "",
  ].filter(Boolean);

  const missingFields = checks
    .filter((check) => !check.ready)
    .map((check) => {
      if (check.label === "Raw prompt") {
        return "Add a rough request or source brief.";
      }
      if (check.label === "Goal") {
        return "Define what a successful output should accomplish.";
      }
      if (check.label === "Audience") {
        return "Specify who the prompt should serve.";
      }
      if (check.label === "Context") {
        return "Add context so the model can anchor its response.";
      }
      if (check.label === "Constraints") {
        return "List hard requirements, exclusions, or must-haves.";
      }
      if (check.label === "Examples") {
        return "Add an example if you need closer control over style or shape.";
      }
      return "Clarify the output structure you want returned.";
    });

  const promptBundle = [
    settings.rawPrompt,
    settings.goal,
    settings.audience,
    settings.context,
    settings.constraints,
    settings.examples,
    settings.desiredStructure,
  ].join("\n");

  const recommendedAction = missingFields.length
    ? missingFields[0]
    : compareCount > 0
      ? "Brief is ready for a side-by-side forge run."
      : "Brief is ready. Forge the next prompt pack.";

  return {
    score,
    strengths: strengths.slice(0, 4),
    missingFields: missingFields.slice(0, 4),
    tokenEstimate: estimateTokenCount(promptBundle),
    recommendedAction,
  };
}

function resolveRunLabel(mode: string | null, providerConfig: ProviderRuntimeConfig) {
  if (mode === "provider") {
    return `Generated with ${providerConfig.provider} • ${providerConfig.model}`;
  }

  if (mode === "heuristic_fallback") {
    return "Provider unavailable, local engine shipped the result";
  }

  if (mode === "heuristic") {
    return "Generated with the local heuristic engine";
  }

  if (mode === "saved") {
    return "Opened from saved prompts";
  }

  if (mode === "restored") {
    return "Restored from recent history";
  }

  return providerConfig.provider === "local"
    ? "Local heuristic engine ready"
    : `${providerConfig.provider} • ${providerConfig.model}`;
}

export function PromptEditor() {
  const searchParams = useSearchParams();
  const restoreId = searchParams.get("restore");
  const presetSlug = searchParams.get("preset");
  const { history, savedPrompts, storageMode, addToSaved, pushHistory } = usePromptifyStore();
  const hasAppliedQueryPreset = useRef(false);
  const hasHydratedDraft = useRef(false);

  const [output, setOutput] = useState<PromptOutput | null>(null);
  const [outputComparisons, setOutputComparisons] = useState<PromptComparisonOutput[]>([]);
  const [outputDiff, setOutputDiff] = useState<PromptDiffPoint[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [providerConfig, setProviderConfig] = useState<ProviderRuntimeConfig>(defaultProviderConfig);
  const [providerCompareModels, setProviderCompareModels] = useState<string[]>([]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [runMode, setRunMode] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [lastGeneratedSignature, setLastGeneratedSignature] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const compareModelsSafe = useMemo(() => {
    if (!compareEnabled) {
      return [];
    }

    const unique = new Set(providerCompareModels);
    unique.delete(providerConfig.model ?? "");
    return Array.from(unique).slice(0, 3);
  }, [compareEnabled, providerCompareModels, providerConfig.model]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: createHeuristicEngineDefaults() as FormData,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control }) as Partial<FormData>;
  const deferredValues = useDeferredValue(watchedValues);

  const restoredEntry = useMemo(() => {
    if (!restoreId) {
      return null;
    }

    const fromHistory = history.find((entry) => entry.id === restoreId);
    if (fromHistory) {
      return fromHistory;
    }

    const sourceSaved = savedPrompts.find((prompt) => prompt.id === restoreId);
    return sourceSaved
      ? {
          id: sourceSaved.id,
          createdAt: sourceSaved.createdAt,
          settings: sourceSaved.settings,
          output: sourceSaved.output,
        }
      : null;
  }, [restoreId, history, savedPrompts]);

  const queryPreset = useMemo(() => {
    return presetSlug ? PRESET_SLUG_MAP[presetSlug] : null;
  }, [presetSlug]);

  const liveSettings = useMemo(() => {
    return normalizePromptSettings(deferredValues ?? form.getValues());
  }, [deferredValues, form]);

  const draftInsights = useMemo(() => buildDraftInsights(liveSettings, compareModelsSafe.length), [liveSettings, compareModelsSafe.length]);

  const activeTemplate = useMemo(
    () => PRESET_LIBRARY.find((preset) => preset.id === liveSettings.templateId),
    [liveSettings.templateId],
  );

  const quickPresets = useMemo(() => {
    const sameCategory = PRESET_LIBRARY.filter(
      (preset) => preset.category === liveSettings.useCase && preset.id !== liveSettings.templateId,
    );
    const fallback = PRESET_LIBRARY.filter(
      (preset) => preset.id !== liveSettings.templateId && !sameCategory.some((candidate) => candidate.id === preset.id),
    );
    return [...sameCategory, ...fallback].slice(0, 3);
  }, [liveSettings.useCase, liveSettings.templateId]);

  const runtimeLabel = providerConfig.provider === "local"
    ? "Local heuristic engine"
    : `${providerConfig.provider} • ${providerConfig.model}`;
  const providerSummary = providerConfig.provider === "local"
    ? "Local-only run path"
    : `BYOK ${providerConfig.provider} session`;
  const compareSummary = compareModelsSafe.length
    ? `${compareModelsSafe.length} compare models selected`
    : compareEnabled
      ? "Compare lab enabled"
      : "Single model run";

  const displayOutput = output || restoredEntry?.output || null;
  const currentDraftSignature = useMemo(() => createSettingsSignature(liveSettings), [liveSettings]);
  const isOutputStale = Boolean(displayOutput && lastGeneratedSignature && currentDraftSignature !== lastGeneratedSignature);

  const applyPresetSelection = useCallback((preset: TemplatePreset, trackSelection = true) => {
    form.reset(formValuesForPreset(preset));
    setOutput(null);
    setOutputComparisons([]);
    setOutputDiff([]);
    setShowCompare(false);
    setDraftRecovered(false);
    setRunMode(null);
    setLastGeneratedAt(null);
    setLastGeneratedSignature(null);

    if (trackSelection) {
      trackEvent("template_selected", { template: preset.id });
    }
  }, [form]);

  const restoreStoredResult = useCallback((settings: PromptSettings, nextOutput: PromptOutput, mode: "saved" | "restored", createdAt: string) => {
    form.reset(settings);
    setOutput(nextOutput);
    setOutputComparisons([]);
    setOutputDiff([]);
    setShowCompare(false);
    setRunMode(mode);
    setLastGeneratedAt(nextOutput.createdAt ?? createdAt);
    setLastGeneratedSignature(createSettingsSignature(settings));
    saveWorkspaceDraftLocal(settings);
    setAutosavedAt(new Date().toISOString());
    setDraftRecovered(false);
  }, [form]);

  useEffect(() => {
    if (!restoreId || !restoredEntry) {
      return;
    }

    restoreStoredResult(restoredEntry.settings, restoredEntry.output, "restored", restoredEntry.createdAt);
    window.history.replaceState({}, "", "/workspace");
  }, [restoreId, restoredEntry, restoreStoredResult]);

  useEffect(() => {
    if (!queryPreset || hasAppliedQueryPreset.current || Boolean(restoreId)) {
      return;
    }

    applyPresetSelection(queryPreset, true);
    hasAppliedQueryPreset.current = true;
  }, [queryPreset, restoreId, applyPresetSelection]);

  useEffect(() => {
    if (hasHydratedDraft.current) {
      return;
    }

    if (restoreId || presetSlug) {
      hasHydratedDraft.current = true;
      return;
    }

    const storedDraft = getWorkspaceDraftLocal();
    hasHydratedDraft.current = true;

    if (!storedDraft) {
      return;
    }

    form.reset(storedDraft.settings);
    setDraftRecovered(true);
    setAutosavedAt(storedDraft.updatedAt);
  }, [form, restoreId, presetSlug]);

  useEffect(() => {
    if (!hasHydratedDraft.current) {
      return;
    }

    const hasMeaningfulContent = Boolean(
      liveSettings.rawPrompt || liveSettings.goal || liveSettings.context || liveSettings.audience || liveSettings.examples,
    );

    const timer = window.setTimeout(() => {
      if (!hasMeaningfulContent) {
        clearWorkspaceDraftLocal();
        setAutosavedAt(null);
        return;
      }

      saveWorkspaceDraftLocal(liveSettings);
      setAutosavedAt(new Date().toISOString());
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [liveSettings]);

  useEffect(() => {
    const onGenerateKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !isGenerating) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("keydown", onGenerateKeyPress);
    return () => {
      window.removeEventListener("keydown", onGenerateKeyPress);
    };
  }, [isGenerating]);

  const applyPreset = () => {
    const useCase = form.getValues("useCase") as FormData["useCase"];
    const preset = PRESET_LIBRARY.find((candidate) => candidate.category === useCase) ?? PRESET_LIBRARY[0];
    applyPresetSelection(preset, true);
  };

  const onSubmit = form.handleSubmit(async (raw) => {
    setIsGenerating(true);
    setShowCompare(false);

    try {
      const settings = normalizePromptSettings(raw, { id: createId("settings") });
      const requestedMode = providerConfig.provider === "local" ? "heuristic" : "provider";
      const generated = await refinePrompt(settings, {
        mode: requestedMode,
        providerConfig: providerConfig.provider === "local" ? undefined : providerConfig,
        compareModels: compareModelsSafe,
      });

      pushHistory({
        id: createId("history"),
        createdAt: new Date().toISOString(),
        settings,
        output: generated.output,
      });

      setOutput(generated.output);
      setOutputComparisons(generated.comparisons ?? []);
      setOutputDiff(generated.diff ?? []);
      setRunMode(generated.mode);
      setLastGeneratedAt(generated.output.createdAt);
      setLastGeneratedSignature(createSettingsSignature(settings));
      setDraftRecovered(false);
      saveWorkspaceDraftLocal(settings);
      setAutosavedAt(new Date().toISOString());

      trackEvent("prompt_generated", {
        useCase: settings.useCase,
        mode: generated.mode,
        model: providerConfig.provider === "local" ? settings.targetModel : providerConfig.model,
      });
    } finally {
      setIsGenerating(false);
    }
  });

  const onSubmitShortcut = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const onSave = (outputToSave: PromptOutput) => {
    const current = normalizePromptSettings(form.getValues(), {
      id: outputToSave.sourceSettingsId,
    });
    addToSaved(outputToSave, current);
    trackEvent("prompt_saved", { id: outputToSave.id, action: "manual-save" });
  };

  const onCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("prompt_copied", { id: displayOutput?.id });
  };

  const onCopySystem = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("prompt_copied", { id: displayOutput?.id, section: "systemPrompt" });
  };

  const onCopyUser = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("prompt_copied", { id: displayOutput?.id, section: "userPrompt" });
  };

  const onCopyDeveloper = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("prompt_copied", { id: displayOutput?.id, section: "developerPrompt" });
  };

  const onCopyPackage = async (outputToCopy: PromptOutput, currentText: string) => {
    await navigator.clipboard.writeText(buildPromptPack(outputToCopy, currentText));
    trackEvent("prompt_copied", { id: outputToCopy.id, section: "promptPack" });
  };

  const onExport = (text: string, format: "txt" | "md") => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${displayOutput?.id || "promptify-output"}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent("export_used", { format });
  };

  const openSavedPrompt = (prompt: SavedPrompt) => {
    restoreStoredResult(prompt.settings, prompt.output, "saved", prompt.updatedAt);
  };

  const clearDraft = () => {
    form.reset(createHeuristicEngineDefaults() as FormData);
    clearWorkspaceDraftLocal();
    setAutosavedAt(null);
    setDraftRecovered(false);
    setOutput(null);
    setOutputComparisons([]);
    setOutputDiff([]);
    setShowCompare(false);
    setRunMode(null);
    setLastGeneratedAt(null);
    setLastGeneratedSignature(null);
    hasAppliedQueryPreset.current = false;
  };

  return (
    <div className="space-y-6">
      <WorkspaceOverview
        draftScore={draftInsights.score}
        savedCount={savedPrompts.length}
        historyCount={history.length}
        compareCount={compareModelsSafe.length}
        storageMode={storageMode}
        runtimeLabel={runtimeLabel}
        activeTemplateTitle={activeTemplate?.title}
        lastAutosavedAt={autosavedAt}
        isDirty={form.formState.isDirty}
        onApplyPreset={applyPreset}
        onClearDraft={clearDraft}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_minmax(340px,0.86fr)]">
        <div className="space-y-4">
          <form ref={formRef} onSubmit={onSubmitShortcut} className="space-y-4">
            <PromptControls
              register={form.register as unknown as UseFormRegister<PromptControlValues>}
              setValue={form.setValue as unknown as UseFormSetValue<PromptControlValues>}
              watch={form.watch as unknown as UseFormWatch<PromptControlValues>}
              compareSummary={compareSummary}
              isGenerating={isGenerating}
              onApplyPreset={applyPreset}
              runtimeLabel={runtimeLabel}
            />

            <ProviderControls
              provider={providerConfig}
              compareEnabled={compareEnabled}
              compareModels={compareModelsSafe}
              onProviderChange={setProviderConfig}
              onCompareModelsChange={setProviderCompareModels}
              onCompareEnabledChange={setCompareEnabled}
            />
          </form>
        </div>

        <WorkspaceSidebar
          draftScore={draftInsights.score}
          tokenEstimate={draftInsights.tokenEstimate}
          missingFields={draftInsights.missingFields}
          strengths={draftInsights.strengths}
          recommendedAction={draftInsights.recommendedAction}
          providerSummary={providerSummary}
          compareSummary={compareSummary}
          draftRestored={draftRecovered}
          activeTemplateTitle={activeTemplate?.title}
          lastAutosavedAt={autosavedAt}
          quickPresets={quickPresets}
          recentHistory={history.slice(0, 3)}
          recentSaved={savedPrompts.slice(0, 3)}
          onUsePreset={(preset) => applyPresetSelection(preset, true)}
          onRestoreHistory={(entry) => restoreStoredResult(entry.settings, entry.output, "restored", entry.createdAt)}
          onOpenSaved={openSavedPrompt}
          onClearDraft={clearDraft}
        />
      </div>

      <div className="space-y-4">
        {!displayOutput ? (
          <EmptyState
            title="No output yet"
            text="Build the brief on the left, use the draft intelligence rail to tighten it, then forge a structured prompt pack."
          />
        ) : (
          <>
            <OutputTabs
              key={displayOutput.id}
              output={displayOutput}
              diff={outputDiff}
              runMode={runMode}
              runLabel={resolveRunLabel(runMode, providerConfig)}
              generatedAt={lastGeneratedAt}
              isStale={isOutputStale}
              comparisons={outputComparisons}
              onCopy={onCopy}
              onCopySystem={onCopySystem}
              onCopyUser={onCopyUser}
              onCopyDeveloper={onCopyDeveloper}
              onCopyPackage={onCopyPackage}
              onSave={onSave}
              onExport={onExport}
              onCompare={() => {
                setShowCompare((state) => !state);
                trackEvent("compare_view_opened", { id: displayOutput.id });
              }}
            />

            {showCompare ? <CompareView original={liveSettings.rawPrompt} output={displayOutput} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
