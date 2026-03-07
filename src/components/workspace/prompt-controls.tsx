"use client";

import { Keyboard, Settings, Sparkles } from "lucide-react";
import { MODEL_OPTIONS, USE_CASE_LABELS } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { DetailLevel, OutputFormat, PromptSettings, PromptTone } from "@/types";

export type PromptControlValues = Partial<Omit<PromptSettings, "id">> & { id?: string };

const toneOptions: PromptTone[] = [
  "neutral",
  "professional",
  "friendly",
  "authoritative",
  "creative",
  "minimal",
  "sales",
  "technical",
];
const outputOptions: OutputFormat[] = ["plain", "bullet", "markdown", "json", "table", "steps"];
const detailOptions: DetailLevel[] = ["concise", "balanced", "detailed"];

type PromptControlsProps = {
  register: UseFormRegister<PromptControlValues>;
  setValue: UseFormSetValue<PromptControlValues>;
  watch: UseFormWatch<PromptControlValues>;
  compareSummary: string;
  isGenerating: boolean;
  onApplyPreset: () => void;
  runtimeLabel: string;
};

export function PromptControls({
  register,
  setValue,
  watch,
  compareSummary,
  isGenerating,
  onApplyPreset,
  runtimeLabel,
}: PromptControlsProps) {
  const includeContext = Boolean(watch("includeContext"));
  const includeConstraints = Boolean(watch("includeConstraints"));
  const includeExamples = Boolean(watch("includeExamples"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" /> Build the prompt brief
        </CardTitle>
        <CardDescription>
          Start with the rough ask, add any direction that matters, then forge the prompt pack without hunting for the action.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="rawPrompt">Raw prompt</Label>
            <Textarea id="rawPrompt" rows={6} placeholder="Paste your rough idea or source brief" {...register("rawPrompt")} />
          </div>
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Input id="goal" placeholder="Define the outcome you need" {...register("goal")} />
          </div>
          <div>
            <Label htmlFor="audience">Audience</Label>
            <Input id="audience" placeholder="e.g., founders, engineers, students" {...register("audience")} />
          </div>
          <div className="md:col-span-2">
            <div className="rounded-[24px] border border-teal-200/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(14,165,233,0.05),rgba(255,255,255,0.88))] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                      Ready to forge
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                      {runtimeLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                      {compareSummary}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Generate the prompt pack from this brief.</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Use the controls below for extra shaping, or forge immediately if the draft is already clear.
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Keyboard className="h-3.5 w-3.5 text-teal-600" />
                    Cmd/Ctrl + Enter to forge instantly
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" size="lg" className="w-full sm:min-w-44" disabled={isGenerating}>
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? "Forging..." : "Forge Prompt"}
                  </Button>
                  <Button size="lg" type="button" variant="outline" onClick={onApplyPreset}>
                    Load template recommendations
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="useCase">Use case</Label>
            <Select id="useCase" {...register("useCase")}>{
              Object.entries(USE_CASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="targetModel">Target model</Label>
            <Select id="targetModel" {...register("targetModel")}>
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select id="tone" {...register("tone")}>{
              toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="outputFormat">Output format</Label>
            <Select id="outputFormat" {...register("outputFormat")}>
              {outputOptions.map((output) => (
                <option key={output} value={output}>
                  {output}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="detailLevel">Detail level</Label>
            <Select id="detailLevel" {...register("detailLevel")}>
              {detailOptions.map((detail) => (
                <option key={detail} value={detail}>
                  {detail}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="desiredStructure">Desired structure</Label>
            <Input id="desiredStructure" placeholder="objective->context->constraints->steps->output" {...register("desiredStructure")} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Optional sections</p>
          <label className="flex items-start gap-2">
            <Checkbox checked={includeContext} onChange={(event) => setValue("includeContext", event.currentTarget.checked)} />
            <span className="text-sm text-slate-700">Include context</span>
          </label>
          {includeContext ? <Textarea {...register("context")} rows={3} placeholder="Product context, stack, constraints" /> : null}

          <label className="flex items-start gap-2">
            <Checkbox checked={includeConstraints} onChange={(event) => setValue("includeConstraints", event.currentTarget.checked)} />
            <span className="text-sm text-slate-700">Include constraints</span>
          </label>
          {includeConstraints ? <Textarea {...register("constraints")} rows={3} placeholder="Hard requirements, rules, forbidden items" /> : null}

          <label className="flex items-start gap-2">
            <Checkbox checked={includeExamples} onChange={(event) => setValue("includeExamples", event.currentTarget.checked)} />
            <span className="text-sm text-slate-700">Include examples</span>
          </label>
          {includeExamples ? <Textarea {...register("examples")} rows={3} placeholder="Good and bad examples" /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
