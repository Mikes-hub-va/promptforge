"use client";

import { Settings } from "lucide-react";
import { MODEL_OPTIONS, USE_CASE_LABELS } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PromptSettings } from "@/types";

export type PromptControlValues = Partial<Omit<PromptSettings, "id">> & { id?: string };

type Tone = "neutral" | "professional" | "friendly" | "authoritative" | "creative" | "minimal" | "sales" | "technical";
type Output = "plain" | "bullet" | "markdown" | "json" | "table" | "steps";
type Detail = "concise" | "balanced" | "detailed";

const toneOptions: Tone[] = ["neutral", "professional", "friendly", "authoritative", "creative", "minimal", "sales", "technical"];
const outputOptions: Output[] = ["plain", "bullet", "markdown", "json", "table", "steps"];
const detailOptions: Detail[] = ["concise", "balanced", "detailed"];

type PromptControlsProps = {
  register: UseFormRegister<PromptControlValues>;
  setValue: UseFormSetValue<PromptControlValues>;
  watch: UseFormWatch<PromptControlValues>;
  onApplyPreset: () => void;
};

export function PromptControls({
  register,
  setValue,
  watch,
  onApplyPreset,
}: PromptControlsProps) {
  const includeContext = Boolean(watch("includeContext"));
  const includeConstraints = Boolean(watch("includeConstraints"));
  const includeExamples = Boolean(watch("includeExamples"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" /> Prompt Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Input id="goal" placeholder="Define the outcome you need" {...register("goal")} />
          </div>
          <div>
            <Label htmlFor="audience">Audience</Label>
            <Input id="audience" placeholder="e.g., founders, engineers, students" {...register("audience")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="rawPrompt">Raw prompt</Label>
            <Textarea id="rawPrompt" rows={5} placeholder="Paste your rough idea" {...register("rawPrompt")} />
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

        <Button size="sm" type="button" variant="outline" onClick={onApplyPreset}>
          Load template recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
