import { createId } from "@/lib/utils/id";
import { collectQualitySignals, estimateQualityScore } from "@/lib/prompt-engine/heuristic";
import type { PromptGenerationInput, PromptGenerationResult, ProviderRuntimeConfig } from "@/lib/prompt-engine/types";
import type { PromptDiffPoint, PromptOutput, PromptOutputVariant, PromptSettings } from "@/types";

type GeminiModelChoice = {
  value: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
};

const modelPresets: Record<string, GeminiModelChoice> = {
  "gemini-2.0-flash": {
    value: "gemini-2.0-flash",
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
  },
  "gemini-1.5-flash": {
    value: "gemini-1.5-flash",
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.3,
  },
  "gemini-1.5-pro": {
    value: "gemini-1.5-pro",
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.0,
  },
};

function normalizeModelChoice(model?: string) {
  if (model && modelPresets[model]) {
    return modelPresets[model];
  }
  if (model) {
    return {
      value: model,
      inputPricePerMillion: 1.25,
      outputPricePerMillion: 5.0,
    };
  }
  return modelPresets["gemini-1.5-flash"];
}

function resolveApiKey(config?: ProviderRuntimeConfig) {
  const explicit = config?.apiKey?.trim();
  if (explicit) return explicit;
  if (config?.provider !== "gemini") return "";
  return process.env.GEMINI_API_KEY?.trim() ?? "";
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
    rationale: ["Gemini framing injected explicit structure", "Model-specific style constraints applied"],
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

function parseGeneratedText(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function runGeminiProvider(
  input: PromptGenerationInput,
  config?: ProviderRuntimeConfig,
): Promise<PromptGenerationResult> {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = normalizeModelChoice(config?.model);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model.value,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(input.settings) }],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "Gemini API request failed");
    }

    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const raw = parts.map((part: { text?: unknown }) => (typeof part?.text === "string" ? part.text : "")).join("");
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error("Gemini returned invalid content.");
    }

    const parsed = parseGeneratedText(raw);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Gemini returned non-JSON content.");
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

export function estimateModelRunCost(inputTokens: number, outputTokens: number, model = "gemini-1.5-flash") {
  const modelChoice = normalizeModelChoice(model);
  const inputCost = (inputTokens / 1_000_000) * modelChoice.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * modelChoice.outputPricePerMillion;
  return inputCost + outputCost;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

