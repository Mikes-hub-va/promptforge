import { PromptDiffPoint, PromptOutput, PromptSettings } from "@/types";

export type ProviderRuntimeConfig = {
  provider: "openai" | "anthropic" | "gemini" | "local";
  model?: string;
  apiKey?: string;
  baseUrl?: string;
};

export interface PromptGenerationInput {
  settings: PromptSettings;
}

export interface PromptGenerationContext {
  provider: "heuristic" | "provider";
  hasProviderConfig: boolean;
  appVersion: string;
  providerConfig?: ProviderRuntimeConfig;
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
    hasProviderConfig: false,
    appVersion: process.env.NEXT_PUBLIC_PROMPTIFY_VERSION
      ?? process.env.NEXT_PUBLIC_PROMPTFORGE_VERSION
      ?? "1.0.0",
  };
}
