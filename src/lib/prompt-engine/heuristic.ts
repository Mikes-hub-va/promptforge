import { createId } from "@/lib/utils/id";
import {
  PromptDiffPoint,
  PromptOutput,
  PromptOutputVariant,
  PromptSettings,
} from "@/types";
import type { PromptGenerationInput, PromptGenerationResult } from "./types";

const formatMap = {
  plain: "Return only plain text with clear section labels.",
  bullet: "Return output as bullet lists.",
  markdown: "Use markdown headings and concise lists.",
  json: "Return JSON with objective/context/constraints/output fields.",
  table: "Use a table-like layout inside markdown.",
  steps: "Return the response as numbered steps.",
};

const toneMap: Record<string, string> = {
  neutral: "Use neutral professional language.",
  professional: "Use a professional, precise, business-appropriate style.",
  friendly: "Use warm and approachable language.",
  authoritative: "Use concise and confident phrasing with strong defaults.",
  creative: "Use vivid phrasing while staying specific.",
  minimal: "Keep language minimal and direct.",
  sales: "Use persuasive language without pressure.",
  technical: "Use technical terminology where helpful and unambiguous.",
};

const detailMap = {
  concise: "Be brief and remove fluff while preserving intent.",
  balanced: "Balance brevity with enough context and assumptions.",
  detailed: "Add thorough constraints, edge cases, output validation, and guardrails.",
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function firstSentence(text: string) {
  const sentence = text.split(/[.!?]/)[0] ?? "";
  return normalize(sentence || text);
}

function objectiveFromSettings(settings: PromptSettings) {
  if (normalize(settings.goal)) {
    return normalize(settings.goal);
  }

  if (normalize(settings.rawPrompt)) {
    return `Clarify and execute: ${firstSentence(settings.rawPrompt)}`;
  }

  return "Generate an improved, action-oriented prompt.";
}

function section(label: string, value?: string) {
  if (!value) {
    return "";
  }
  return `${label}:\n${normalize(value)}`;
}

function contextLines(settings: PromptSettings) {
  const rows = [
    section("Objective", objectiveFromSettings(settings)),
    section("Target model", settings.targetModel),
    section("Use case", settings.useCase),
    section("Tone", settings.tone),
    section("Output format", settings.outputFormat),
    section("Detail level", settings.detailLevel),
    settings.includeContext ? section("Context", settings.context) : "",
    settings.audience ? section("Audience", settings.audience) : "",
    settings.includeConstraints ? section("Constraints", settings.constraints) : "",
    settings.includeExamples ? section("Examples", settings.examples) : "",
    section("Desired structure", settings.desiredStructure),
    section("Original raw prompt", settings.rawPrompt),
  ].filter(Boolean);

  return rows
    .map((row, index) => `## ${index + 1}. ${row.split("\n")[0]}\n${row.split("\n").slice(1).join("\n")}`)
    .join("\n\n");
}

function promptVariants(settings: PromptSettings): PromptOutputVariant[] {
  const baseTemplate = buildTemplate(settings, settings.detailLevel);
  const concise = buildTemplate({ ...settings, detailLevel: "concise" }, "concise");
  const balanced = baseTemplate;
  const detailed = buildTemplate({ ...settings, detailLevel: "detailed" }, "detailed");
  const variantA = buildTemplate({ ...settings, tone: "creative", detailLevel: "detailed" }, "detailed");
  const variantB = buildTemplate({ ...settings, tone: "minimal", detailLevel: "balanced" }, "balanced");
  const model = buildTemplate({ ...settings, detailLevel: "detailed" }, "detailed");

  return [
    {
      id: createId("variant"),
      label: "Concise",
      prompt: concise,
      rationale: ["Shortened phrasing", "Removed ambiguity", "Kept mandatory constraints"],
    },
    {
      id: createId("variant"),
      label: "Detailed",
      prompt: detailed,
      rationale: ["Expanded edge cases", "Added stronger validation", "More deterministic structure"],
    },
    {
      id: createId("variant"),
      label: "Improved",
      prompt: balanced,
      rationale: ["Goal clarified", "Formatting aligned", "Context injection applied"],
    },
    {
      id: createId("variant"),
      label: "Variant A",
      prompt: variantA,
      rationale: ["Alternative voice", "Higher creativity", "Same constraints preserved"],
    },
    {
      id: createId("variant"),
      label: "Variant B",
      prompt: variantB,
      rationale: ["Minimal style", "Low verbosity", "Fast execution focus"],
    },
    {
      id: createId("variant"),
      label: `Model: ${settings.targetModel}`,
      prompt: model,
      rationale: ["Model-specific framing", "Instruction priority adjusted", "Explicit task contract added"],
      isModelSpecific: true,
    },
  ];
}

function buildTemplate(settings: PromptSettings, detailLevel: "concise" | "balanced" | "detailed") {
  const blocks = [
    "PromptForge Refined Prompt",
    toneMap[settings.tone] ?? toneMap.neutral,
    formatMap[settings.outputFormat] ?? formatMap.plain,
    detailMap[detailLevel],
    `Objective\n- ${objectiveFromSettings(settings)}`,
    section("Context", settings.includeContext ? settings.context : "") + "\n",
    section("Audience", settings.audience),
    section("Constraints", settings.includeConstraints ? settings.constraints : ""),
    section("Desired Format", `Tone: ${settings.tone} | Output: ${settings.outputFormat} | Detail: ${settings.detailLevel}`),
    `Requested output\n- Use the user input as intent source\n- Return in ${settings.outputFormat}`,
    section("Success criteria", "Output must be self-consistent, specific, and directly actionable"),
    section("Original input", settings.rawPrompt),
  ]
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

  const structure = settings.desiredStructure
    ? settings.desiredStructure
        .split(/[>,;\n]/)
        .map((piece) => `- ${piece.trim()}`)
        .join("\n")
    : "- Clarify objective\n- Add constraints\n- Define output shape\n- Add quality checks";

  return `${blocks}\n\nSuggested structure\n${structure}`;
}

function buildStructuredPrompt(settings: PromptSettings, base: string) {
  return [
    "# Structured Prompt",
    `## Objective`,
    `- ${objectiveFromSettings(settings)}`,
    "## Inputs",
    `- Use case: ${settings.useCase}`,
    `- Raw input: ${normalize(settings.rawPrompt) || "(not provided)"}`,
    settings.includeContext && settings.context ? `- Context: ${normalize(settings.context)}` : null,
    settings.audience ? `- Audience: ${normalize(settings.audience)}` : null,
    "## Guardrails",
    `- Constraints: ${settings.includeConstraints ? normalize(settings.constraints) : "Use safe defaults."}`,
    "## Validation",
    "- Ensure the response is specific and actionable.",
    "- Verify required format and tone are followed.",
    `- Return in ${settings.outputFormat} with ${settings.detailLevel} detail.`,
    "",
    "## Draft Template",
    base,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildRationale(settings: PromptSettings): PromptDiffPoint[] {
  return [
    {
      label: "Objective clarified",
      note: `Inferred a concrete objective: ${objectiveFromSettings(settings)}.`,
    },
    {
      label: "Structure inserted",
      note: "Prompt now has objective, constraints, outputs, and validation sections.",
    },
    {
      label: "Tone aligned",
      note: `Applied ${settings.tone} tone and ${settings.outputFormat} formatting.`,
    },
    {
      label: "Model framing",
      note: `Added ${settings.targetModel}-aware instruction block and output contract.`,
    },
    {
      label: "Variants generated",
      note: "Produced concise, detailed, and alternate variant paths for user choice.",
    },
  ];
}

function buildDiff(settings: PromptSettings): PromptDiffPoint[] {
  return [
    {
      label: "Input normalized",
      note: "Standardized spacing and sentence boundaries for deterministic parsing.",
    },
    {
      label: "Goal extracted",
      note: objectiveFromSettings(settings),
    },
    {
      label: "Context enrichment",
      note: settings.includeContext
        ? `Added context block (${normalize(settings.context || "") || "custom"}).`
        : "Kept context inference lightweight due opt-out.",
    },
    {
      label: "Constraint injection",
      note: settings.includeConstraints
        ? `Applied explicit constraints: ${normalize(settings.constraints || "")}`
        : "Applied default safety constraints.",
    },
    {
      label: "Output contract",
      note: `Enforced response format and detail level (${settings.outputFormat}/${settings.detailLevel}).`,
    },
  ];
}

export async function runHeuristicEngine(
  input: PromptGenerationInput,
): Promise<PromptGenerationResult> {
  const settings = input.settings;
  const base = buildTemplate(settings, settings.detailLevel);
  const structured = buildStructuredPrompt(settings, contextLines(settings));
  const variants = promptVariants(settings);
  const rationaleSummary = buildRationale(settings).map((entry) => `${entry.label}: ${entry.note}`);

  const output: PromptOutput = {
    id: createId("output"),
    sourceSettingsId: settings.id,
    createdAt: new Date().toISOString(),
    basePrompt: base,
    variants,
    structuredPrompt: structured,
    systemPrompt: contextLines(settings),
    userPrompt: `Raw prompt:\n${normalize(settings.rawPrompt)}`,
    developerPrompt: `Role: improve usability and executionability without changing intent.`,
    rationaleSummary,
  };

  return {
    output,
    diff: buildDiff(settings),
  };
}
