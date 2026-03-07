import { createId } from "@/lib/utils/id";
import { collectQualitySignals, estimateQualityScore } from "@/lib/prompt-engine/heuristic";
import { validateOpenAICompatibleBaseUrl } from "@/lib/security/provider-endpoints";
import type {
  PromptGenerationInput,
  PromptGenerationResult,
  ProviderRuntimeConfig,
} from "@/lib/prompt-engine/types";
import type { PromptOutput, PromptOutputVariant, PromptSettings, PromptDiffPoint } from "@/types";

type OpenAIModelChoice = {
  value: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
};

const modelPresets: Record<string, OpenAIModelChoice> = {
  "openai/gpt-oss-20b": {
    value: "openai/gpt-oss-20b",
    inputPricePerMillion: 0.03,
    outputPricePerMillion: 0.14,
  },
  "google/gemini-2.0-flash-lite-001": {
    value: "google/gemini-2.0-flash-lite-001",
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.3,
  },
  "gpt-4.1-mini": {
    value: "gpt-4.1-mini",
    inputPricePerMillion: 0.4,
    outputPricePerMillion: 1.6,
  },
  "gpt-4o-mini": {
    value: "gpt-4o-mini",
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
  },
};

function normalizeModelChoice(model?: string) {
  if (model && modelPresets[model]) {
    return modelPresets[model];
  }
  if (model) {
    return {
      value: model,
      inputPricePerMillion: 0.4,
      outputPricePerMillion: 1.6,
    };
  }
  return modelPresets[process.env.OPENAI_PROMPT_MODEL?.trim() || "openai/gpt-oss-20b"] ?? modelPresets["openai/gpt-oss-20b"];
}

function normalizeBaseUrl(input?: string) {
  if (!input) {
    return "";
  }

  const cleaned = input.trim().replace(/\s+/g, "");
  if (!cleaned) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) {
    return cleaned.replace(/\/+$/, "");
  }

  return `https://${cleaned}`.replace(/\/+$/, "");
}

function resolveApiKey(config?: ProviderRuntimeConfig) {
  const explicit = config?.apiKey?.trim();
  if (explicit) return explicit;
  if (config?.provider !== "openai") {
    return "";
  }
  return process.env.OPENAI_API_KEY?.trim() ?? "";
}

function resolveEndpoint(config?: ProviderRuntimeConfig) {
  const normalizedBaseUrl = normalizeBaseUrl(config?.baseUrl || process.env.OPENAI_API_BASE_URL);

  if (!normalizedBaseUrl) {
    return "https://api.openai.com/v1/chat/completions";
  }

  const validation = validateOpenAICompatibleBaseUrl(normalizedBaseUrl);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const base = validation.value ?? normalizedBaseUrl;

  if (/\/v1\/?chat\/?completions\/?$/i.test(base)) {
    return `${base}`;
  }
  if (/\/v1\/?$/i.test(base)) {
    return `${base}/chat/completions`;
  }
  return `${base}/v1/chat/completions`;
}

function resolveExtraHeaders(config?: ProviderRuntimeConfig) {
  const normalizedBaseUrl = normalizeBaseUrl(config?.baseUrl || process.env.OPENAI_API_BASE_URL);
  if (!normalizedBaseUrl || !/openrouter\.ai/i.test(normalizedBaseUrl)) {
    return {};
  }

  const headers: Record<string, string> = {};
  const siteUrl = process.env.OPENAI_SITE_URL?.trim();
  const appName = process.env.OPENAI_APP_NAME?.trim();

  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  if (appName) {
    headers["X-Title"] = appName;
  }

  return headers;
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

function normalizeVariants(rawVariants: unknown, settings: PromptSettings): PromptOutput["variants"] {
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
    rationale: ["AI refinement used for improved structure", "Model output was aligned to requested format"],
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
    { label: "Goal formalized", note: `Objective interpreted as: ${sanitizeText(settings.goal) || "general execution prompt"}` },
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

export async function runOpenAIProvider(
  input: PromptGenerationInput,
  config?: ProviderRuntimeConfig,
): Promise<PromptGenerationResult> {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const model = normalizeModelChoice(config?.model);
  const endpoint = resolveEndpoint(config);
  const extraHeaders = resolveExtraHeaders(config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: model.value,
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are Promptify. Be precise, practical, and concise.",
          },
          {
            role: "user",
            content: buildPrompt(input.settings),
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "OpenAI API request failed");
    }

    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") {
      throw new Error("OpenAI returned invalid content.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("OpenAI returned non-JSON content.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid OpenAI output payload.");
    }

    const cast = parsed as Record<string, unknown>;
    const basePrompt = sanitizeText(typeof cast.basePrompt === "string" ? cast.basePrompt : "");
    const structuredPrompt = sanitizeText(typeof cast.structuredPrompt === "string" ? cast.structuredPrompt : "");
    const systemPrompt = sanitizeText(typeof cast.systemPrompt === "string" ? cast.systemPrompt : "");
    const userPrompt = sanitizeText(typeof cast.userPrompt === "string" ? cast.userPrompt : "");

    const normalizedQualityFlags = clampRationale(cast.qualityFlags);
    const qualityScoreValue =
      typeof cast.qualityScore === "number" ? cast.qualityScore : estimateQualityScore(input.settings);
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

    const qualityEstimate = output.qualityScore ?? estimateQualityScore(input.settings);
    const qualityScore = Math.max(0, Math.min(100, Math.round(qualityEstimate)));

    return {
      output: {
        ...output,
        qualityScore,
      },
      diff: normalizeDiff(cast.diff).slice(0, 8).length ? normalizeDiff(cast.diff) : buildFallbackDiff(input.settings),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function estimateModelRunCost(inputTokens: number, outputTokens: number, model = process.env.OPENAI_PROMPT_MODEL?.trim() || "openai/gpt-oss-20b") {
  const modelChoice = normalizeModelChoice(model);
  const inputCost = (inputTokens / 1_000_000) * modelChoice.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * modelChoice.outputPricePerMillion;
  return inputCost + outputCost;
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
