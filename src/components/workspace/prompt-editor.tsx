"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PromptControlValues, PromptControls } from "./prompt-controls";
import { CompareView } from "./compare-view";
import { OutputTabs } from "./output-tabs";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { usePromptForgeStore } from "@/lib/storage/manager";
import { PromptOutput, PromptSettings } from "@/types";
import { PRESET_LIBRARY } from "@/data/presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createHeuristicEngineDefaults, refinePrompt } from "@/lib/prompt-engine/factory";
import { trackEvent } from "@/lib/analytics";
import { createId } from "@/lib/utils/id";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

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

export function PromptEditor() {
  const searchParams = useSearchParams();
  const { history, addToSaved, pushHistory } = usePromptForgeStore();

  const [output, setOutput] = useState<PromptOutput | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: createHeuristicEngineDefaults() as FormData,
    mode: "onChange",
  });

  const restoredEntry = useMemo(() => {
    const restoreId = searchParams.get("restore");
    return restoreId ? history.find((entry) => entry.id === restoreId) : null;
  }, [searchParams, history]);

  useEffect(() => {
    const restoreId = searchParams.get("restore");
    if (!restoredEntry || !restoreId) {
      return;
    }

    form.reset(restoredEntry.settings);
    window.history.replaceState({}, "", "/workspace");
    trackEvent("compare_view_opened", { restoreId });
  }, [restoredEntry, searchParams, form]);

  const displayOutput = output || restoredEntry?.output || null;

  const applyPreset = () => {
    const preset = PRESET_LIBRARY[0];
    form.reset({ ...createHeuristicEngineDefaults(), ...preset.defaultSettings, templateId: preset.id });
    trackEvent("template_selected", { template: preset.id });
  };

  const onSubmit = form.handleSubmit(async (raw) => {
    const defaults = createHeuristicEngineDefaults();
    const settings: PromptSettings = {
      ...defaults,
      ...raw,
      id: createId("settings"),
      targetModel: raw.targetModel ?? "chatgpt",
      rawPrompt: (raw.rawPrompt ?? "").trim(),
      goal: (raw.goal ?? "").trim(),
      context: (raw.context ?? "").trim(),
      audience: (raw.audience ?? "").trim(),
      constraints: (raw.constraints ?? "").trim(),
      examples: (raw.examples ?? "").trim(),
      desiredStructure: (raw.desiredStructure ?? "").trim(),
    };

    const generated = await refinePrompt(settings);

    pushHistory({
      id: createId("history"),
      createdAt: new Date().toISOString(),
      settings,
      output: generated.output,
    });
    addToSaved(generated.output, settings);
    setOutput(generated.output);
    trackEvent("prompt_generated", { useCase: settings.useCase, model: settings.targetModel });
  });

  const onCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("prompt_copied", { id: output?.id ?? restoredEntry?.id });
  };

  const onExport = (text: string, format: "txt" | "md") => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${displayOutput?.id || "promptforge-output"}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent("export_used", { format });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Forge Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <PromptControls
                register={form.register as unknown as UseFormRegister<PromptControlValues>}
                setValue={form.setValue as unknown as UseFormSetValue<PromptControlValues>}
                watch={form.watch as unknown as UseFormWatch<PromptControlValues>}
                onApplyPreset={applyPreset}
              />
              <Button type="submit" className="w-full">Forge Prompt</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {!displayOutput ? (
          <EmptyState
            title="No output yet"
            text="Add your rough prompt and click Forge Prompt to generate improved versions."
          />
        ) : (
          <>
            <OutputTabs
              output={displayOutput}
              onCopy={onCopy}
              onExport={onExport}
              onCompare={() => setShowCompare((state) => !state)}
            />
            {showCompare ? (
              <CompareView original={form.getValues("rawPrompt") ?? ""} output={displayOutput} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
