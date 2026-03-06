import type { PromptEnhancer, PromptGenerationContext, PromptGenerationInput, PromptGenerationResult } from "./types";
import { runHeuristicEngine } from "./heuristic";

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

function withProviderPlaceholder(): PromptEnhancer {
  // TODO: add OpenAI / Anthropic / Bedrock adapters behind a simple interface.
  return withHeuristicProvider();
}

export function createPromptProvider(): PromptEnhancer {
  if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
    return withProviderPlaceholder();
  }
  return withHeuristicProvider();
}

export async function generatePromptWithEngine(
  input: PromptGenerationInput,
  context: PromptGenerationContext,
): Promise<PromptGenerationResult> {
  const provider = createPromptProvider();
  return provider.generate(input, context);
}
