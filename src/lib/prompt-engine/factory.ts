import { PromptSettings, PromptTone, OutputFormat, DetailLevel } from "@/types";
import { createId } from "@/lib/utils/id";
import { makeContext } from "./types";
import { generatePromptWithEngine } from "./provider";

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

export async function refinePrompt(settings: PromptSettings) {
  return generatePromptWithEngine({ settings }, makeContext());
}
