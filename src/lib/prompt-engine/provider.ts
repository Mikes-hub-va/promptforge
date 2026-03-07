import type { PromptEnhancer, PromptGenerationContext, PromptGenerationInput, PromptGenerationResult } from "./types";
import { runHeuristicEngine } from "./heuristic";
import { isOpenAIConfigured, runOpenAIProvider } from "@/lib/prompt-engine/providers/openai";
import { isAnthropicConfigured, runAnthropicProvider } from "@/lib/prompt-engine/providers/anthropic";
import { isGeminiConfigured, runGeminiProvider } from "@/lib/prompt-engine/providers/gemini";

function withHeuristicProvider(): PromptEnhancer {
  return {
    name: "heuristic",
    isConfigured: true,
    generate: (input: PromptGenerationInput, ctx: PromptGenerationContext) => {
      void ctx;
      return runHeuristicEngine(input);
    },
  };
}

function withOpenAIProvider(): PromptEnhancer {
  if (!isOpenAIConfigured()) {
    return withHeuristicProvider();
  }

  return {
    name: "openai",
    isConfigured: true,
    generate: async (input: PromptGenerationInput, ctx: PromptGenerationContext) =>
      runOpenAIProvider(input, ctx.providerConfig),
  };
}

function withAnthropicProvider(): PromptEnhancer {
  if (!isAnthropicConfigured()) {
    return withHeuristicProvider();
  }

  return {
    name: "anthropic",
    isConfigured: true,
    generate: async (input: PromptGenerationInput, ctx: PromptGenerationContext) =>
      runAnthropicProvider(input, ctx.providerConfig),
  };
}

function withGeminiProvider(): PromptEnhancer {
  if (!isGeminiConfigured()) {
    return withHeuristicProvider();
  }

  return {
    name: "gemini",
    isConfigured: true,
    generate: async (input: PromptGenerationInput, ctx: PromptGenerationContext) =>
      runGeminiProvider(input, ctx.providerConfig),
  };
}

function withLocalOrThirdParty(): PromptEnhancer {
  if (process.env.ANTHROPIC_API_KEY) {
    return withAnthropicProvider();
  }

  if (process.env.GEMINI_API_KEY) {
    return withGeminiProvider();
  }

  return withHeuristicProvider();
}

export function createPromptProvider(context?: PromptGenerationContext): PromptEnhancer {
  if (context?.provider === "provider") {
    const requestedProvider = context?.providerConfig?.provider;
    if (requestedProvider === "openai") {
      return withOpenAIProvider();
    }
    if (requestedProvider === "anthropic") {
      return withAnthropicProvider();
    }
    if (requestedProvider === "gemini") {
      return withGeminiProvider();
    }
    if (requestedProvider && requestedProvider !== "local") {
      return withLocalOrThirdParty();
    }
    return withHeuristicProvider();
  }

  if (context?.hasProviderConfig) {
    const configuredProvider = context?.providerConfig?.provider;
    if (configuredProvider === "openai") {
      return withOpenAIProvider();
    }
    if (configuredProvider === "anthropic") {
      return withAnthropicProvider();
    }
    if (configuredProvider === "gemini") {
      return withGeminiProvider();
    }
    if (configuredProvider && configuredProvider !== "local") {
      return withLocalOrThirdParty();
    }
    return withHeuristicProvider();
  }

  if (isOpenAIConfigured()) {
    return withOpenAIProvider();
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return withLocalOrThirdParty();
  }

  return withHeuristicProvider();
}

export async function generatePromptWithEngine(
  input: PromptGenerationInput,
  context: PromptGenerationContext,
): Promise<PromptGenerationResult> {
  const provider = createPromptProvider(context);
  return provider.generate(input, context);
}
