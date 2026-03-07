import {
  PromptSettings,
  PromptTone,
  OutputFormat,
  DetailLevel,
  PromptComparisonOutput,
} from "@/types";
import { createId } from "@/lib/utils/id";
import { makeContext, PromptGenerationContext, ProviderRuntimeConfig } from "./types";
import { generatePromptWithEngine } from "./provider";
import type { PromptGenerationResult } from "./types";

export type GenerationMode = "auto" | "heuristic" | "provider";

export type GenerationRequestOptions = {
  mode?: GenerationMode;
  providerConfig?: ProviderRuntimeConfig;
  compareModels?: string[];
};

type ServerGenerationResponse = {
  output: PromptGenerationResult["output"];
  diff: PromptGenerationResult["diff"];
  mode: string;
  comparisons?: PromptComparisonOutput[];
};

export function createHeuristicEngineDefaults(): PromptSettings {
  return {
    id: createId("settings"),
    rawPrompt: "",
    goal: "",
    targetModel: "chatgpt",
    useCase: "productivity",
    tone: "professional" as PromptTone,
    outputFormat: "markdown" as OutputFormat,
    detailLevel: "balanced" as DetailLevel,
    includeContext: true,
    context: "",
    audience: "",
    includeConstraints: true,
    constraints: "Avoid unsupported claims. Be specific and testable.",
    includeExamples: false,
    examples: "",
    desiredStructure: "objective -> context -> constraints -> steps -> output format",
  };
}

export async function refinePrompt(settings: PromptSettings, options: GenerationRequestOptions = {}) {
  if (typeof window !== "undefined") {
    const mode = options.mode
      ?? (process.env.NEXT_PUBLIC_PROMPTIFY_ENGINE_MODE as GenerationMode | undefined)
      ?? (process.env.NEXT_PUBLIC_PROMPTFORGE_ENGINE_MODE as GenerationMode | undefined)
      ?? "auto";
    const hasForcedProvider = mode === "provider";
    const preferredMode: GenerationMode = hasForcedProvider ? "provider" : mode;
    const compareModels = Array.isArray(options.compareModels) ? options.compareModels.slice(0, 3) : [];

    try {
      const response = await fetch("/api/promptify/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings,
          mode: preferredMode,
          providerConfig: options.providerConfig,
          compareModels,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server generation failed with ${response.status}`);
      }

      const payload = (await response.json()) as ServerGenerationResponse;
      if (payload?.output) {
        return {
          output: payload.output,
          mode: payload.mode,
          diff: payload.diff ?? [],
          comparisons: payload.comparisons,
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Prompt generation route unavailable; falling back to local engine.", error);
      }
    }
  }

  const context: PromptGenerationContext = {
    ...makeContext(),
    hasProviderConfig: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY),
    providerConfig: options.providerConfig,
  };
  const result = await generatePromptWithEngine({ settings }, context);
  const fallbackMode: GenerationMode | "heuristic_fallback" = options.mode === "provider" ? "heuristic_fallback" : context.provider;
  return {
    output: result.output,
    mode: fallbackMode,
    diff: result.diff,
    comparisons: [],
  };
}
