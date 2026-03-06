import { PromptDiffPoint, PromptOutput, PromptSettings } from "@/types";

export interface PromptGenerationInput {
  settings: PromptSettings;
}

export interface PromptGenerationContext {
  provider: "heuristic" | "provider";
  appVersion: string;
}

export interface PromptGenerationResult {
  output: PromptOutput;
  diff: PromptDiffPoint[];
}

export interface PromptEnhancer {
  name: string;
  isConfigured: boolean;
  generate(input: PromptGenerationInput, ctx: PromptGenerationContext): Promise<PromptGenerationResult>;
}

export function makeContext() {
  return {
    provider: "heuristic" as const,
    appVersion: process.env.NEXT_PUBLIC_PROMPTFORGE_VERSION ?? "1.0.0",
  };
}
