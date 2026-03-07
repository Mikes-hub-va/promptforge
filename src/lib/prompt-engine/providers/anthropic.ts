import { createId } from "@/lib/utils/id";
import { collectQualitySignals, estimateQualityScore } from "@/lib/prompt-engine/heuristic";
import type { PromptGenerationInput, PromptGenerationResult, ProviderRuntimeConfig } from "@/lib/prompt-engine/types";
import type { PromptDiffPoint, PromptOutput, PromptOutputVariant, PromptSettings } from "@/types";

type AnthropicModelChoice = {
  value: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
};

const modelPresets: Record<string, AnthropicModelChoice> = {
  "claude-3.5-sonnet": {
    value: "claude-3.5-sonnet",
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
  },
  "claude-3.5-haiku": {
    value: "claude-3.5-haiku",
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 4.0,
  },
  "claude-3-opus-20240229": {
    value: "claude-3-opus-20240229",
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 75.0,
  },
};

function normalizeModelChoice(model?: string) {
  if (model && modelPresets[model]) {
    return modelPresets[model];
  }
  if (model) {
    return {
      value: model,
      inputPricePerMillion: 3.0,
      outputPricePerMillion: 15.0,
    };
  }
  return modelPresets["claude-3.5-sonnet"];
}

function resolveApiKey(config?: ProviderRuntimeConfig) {
  const explicit = config?.apiKey?.trim();
  if (explicit) {
    return explicit;
  }
  if (config?.provider !== "anthropic") {
    return "";
  }
  return process.env.ANTHROPIC_API_KEY?.trim() ?? "";
}

function sanitizeText(value: string) {
  return value.trim();
}

function clampRationale(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => sanitizeText(entry))
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeVariants(rawVariants: unknown, settings: PromptSettings): PromptOutputVariant[] {
  if (!Array.isArray(rawVariants)) {
    return [];
  }

  const safe: PromptOutputVariant[] = [];
  for (const entry of rawVariants) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const cast = entry as {
      id?: string;
      label?: string;
      prompt?: string;
      rationale?: unknown;
      isModelSpecific?: boolean;
    };
    const label = sanitizeText(cast.label ?? "");
    const prompt = sanitizeText(cast.prompt ?? "");
    if (!label || !prompt) {
      continue;
    }
    safe.push({
      id: cast.id ? sanitizeText(cast.id) : createId("variant"),
      label,
      prompt,
      rationale: clampRationale(cast.rationale),
      isModelSpecific: Boolean(cast.isModelSpecific),
    });
  }

  if (safe.length >= 4) {
    return safe;
  }

  const fallback: PromptOutputVariant = {
    id: createId("variant"),
    label: "Model-polished",
    prompt:
      `Role: ${sanitizeText(settings.targetModel)} output specialist.\n` +
      `Objective: ${sanitizeText(settings.rawPrompt).slice(0, 400) || "Refine user prompt with precision."}\n` +
      `Target format: ${settings.outputFormat}\nTone: ${settings.tone}`,
    rationale: ["Anthropic framing added structure", "Task intent preserved with explicit guardrails"],
  };
  return [...safe, fallback].slice(0, 6);
}

function normalizeDiff(rawDiff: unknown): PromptDiffPoint[] {
  if (!Array.isArray(rawDiff)) {
    return [];
  }
  const output: PromptDiffPoint[] = [];

  for (const item of rawDiff) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as { label?: unknown; note?: unknown };
    if (typeof candidate.label !== "string" || typeof candidate.note !== "string") {
      continue;
    }

    output.push({ label: candidate.label, note: candidate.note });
  }

  return output;
}

function buildFallbackDiff(settings: PromptSettings): PromptDiffPoint[] {
  return [
    { label: "Objective formalized", note: `Objective interpreted as: ${sanitizeText(settings.goal) || "general execution prompt"}` },
    { label: "Structure injected", note: "Prompt blocks for objective, context, constraints, output contract added." },
    { label: "Model-aware framing", note: `Prompt adjusted for ${settings.targetModel} behavior.` },
  ];
}

function buildPrompt(settings: PromptSettings) {
  return `You are Promptify, a deterministic prompt-engineering assistant.\n\n` +
    `Task: Convert the input settings into a refined prompt package.\n` +
    `Return strict JSON only, with these fields: basePrompt, structuredPrompt, systemPrompt, userPrompt, developerPrompt, variants, rationaleSummary, qualityFlags, qualityScore, diff.\n` +
    `- basePrompt: canonical refined prompt block.\n` +
    `- structuredPrompt: same output with headings and section labels.\n` +
    `- systemPrompt: sectionized system text.\n` +
    `- userPrompt: user-side actionable prompt.\n` +
    `- developerPrompt: optional developer note.\n` +
    `- variants: array of objects with label, prompt, rationale, optional isModelSpecific.\n` +
    `- rationaleSummary: array of short human-readable reasons.\n` +
    `- qualityFlags: list of what improved.\n` +
    `- qualityScore: number 0-100.\n` +
    `- diff: array of {label, note}.\n\n` +
    `Settings JSON:\n${JSON.stringify(settings, null, 2)}`;
}

export async function runAnthropicProvider(
  input: PromptGenerationInput,
  config?: ProviderRuntimeConfig,
): Promise<PromptGenerationResult> {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured.");
  }

  const model = normalizeModelChoice(config?.model);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model.value,
        max_tokens: 1200,
        temperature: 0.25,
        system: "You are Promptify. Be precise, practical, and concise.",
        messages: [{ role: "user", content: buildPrompt(input.settings) }],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "Anthropic API request failed");
    }

    const raw = payload?.content?.[0]?.text;
    if (typeof raw !== "string") {
      throw new Error("Anthropic returned invalid content.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Anthropic returned non-JSON content.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid Anthropic output payload.");
    }

    const cast = parsed as Record<string, unknown>;
    const basePrompt = sanitizeText(typeof cast.basePrompt === "string" ? cast.basePrompt : "");
    const structuredPrompt = sanitizeText(typeof cast.structuredPrompt === "string" ? cast.structuredPrompt : "");
    const systemPrompt = sanitizeText(typeof cast.systemPrompt === "string" ? cast.systemPrompt : "");
    const userPrompt = sanitizeText(typeof cast.userPrompt === "string" ? cast.userPrompt : "");

    const normalizedQualityFlags = clampRationale(cast.qualityFlags);
    const qualityScoreValue = typeof cast.qualityScore === "number" ? cast.qualityScore : estimateQualityScore(input.settings);
    const variants = normalizeVariants(cast.variants, input.settings);

    const output: PromptOutput = {
      id: createId("output"),
      sourceSettingsId: input.settings.id,
      createdAt: new Date().toISOString(),
      basePrompt: basePrompt || "Promptify refined output",
      qualityScore: qualityScoreValue,
      qualityFlags: normalizedQualityFlags.length ? normalizedQualityFlags : collectQualitySignals(input.settings),
      variants,
      structuredPrompt:
        structuredPrompt ||
        [
          "# Structured Prompt",
          `## Objective\n- ${sanitizeText(input.settings.goal || input.settings.rawPrompt).slice(0, 200)}`,
          `## Output format\n- ${input.settings.outputFormat}`,
          `## Tone\n- ${input.settings.tone}`,
          `## Objective\n- ${sanitizeText(input.settings.rawPrompt).slice(0, 240)}`,
        ].join("\n"),
      systemPrompt: systemPrompt || `Objective: ${sanitizeText(input.settings.goal || input.settings.rawPrompt).slice(0, 240)}`,
      userPrompt: userPrompt || `Raw prompt:\n${sanitizeText(input.settings.rawPrompt)}`,
      developerPrompt: typeof cast.developerPrompt === "string" ? cast.developerPrompt : "Use refined constraints and output contract.",
      rationaleSummary: clampRationale(cast.rationaleSummary),
    };

    return {
      output: {
        ...output,
        qualityScore: output.qualityScore ? Math.max(0, Math.min(100, Math.round(output.qualityScore))) : qualityScoreValue,
      },
      diff: normalizeDiff(cast.diff).length ? normalizeDiff(cast.diff) : buildFallbackDiff(input.settings),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function estimateModelRunCost(inputTokens: number, outputTokens: number, model = "claude-3.5-sonnet") {
  const modelChoice = normalizeModelChoice(model);
  const inputCost = (inputTokens / 1_000_000) * modelChoice.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * modelChoice.outputPricePerMillion;
  return inputCost + outputCost;
}

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

