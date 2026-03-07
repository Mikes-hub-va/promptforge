import { createId } from "@/lib/utils/id";
import { PromptDiffPoint, PromptOutput, PromptOutputVariant, PromptSettings, UseCaseCategory } from "@/types";
import type { PromptGenerationInput, PromptGenerationResult } from "./types";

const toneProfiles: Record<
  string,
  {
    voice: string;
    priorities: string[];
    forbidden: string[];
  }
> = {
  neutral: {
    voice: "Use neutral, direct language with no hype or unnecessary flourish.",
    priorities: ["clarity", "consistency", "balanced phrasing"],
    forbidden: ["grand claims", "dramatic language"],
  },
  professional: {
    voice: "Write in a polished, business-ready tone with precise wording and clean structure.",
    priorities: ["credibility", "clarity", "decision-ready output"],
    forbidden: ["casual slang", "vagueness"],
  },
  friendly: {
    voice: "Sound warm, clear, and collaborative while staying useful and specific.",
    priorities: ["approachability", "clarity", "reader comfort"],
    forbidden: ["cold robotic phrasing", "needless jargon"],
  },
  authoritative: {
    voice: "Use confident, high-signal language with strong defaults and minimal hedging.",
    priorities: ["decisiveness", "structure", "clear direction"],
    forbidden: ["tentative phrasing", "waffling"],
  },
  creative: {
    voice: "Use imaginative but controlled language that adds originality without losing precision.",
    priorities: ["novelty", "specificity", "memorable phrasing"],
    forbidden: ["generic filler", "conflicting style cues"],
  },
  minimal: {
    voice: "Keep wording lean, compressed, and action-oriented.",
    priorities: ["brevity", "signal density", "fast execution"],
    forbidden: ["long setup", "redundancy"],
  },
  sales: {
    voice: "Use persuasive language grounded in outcomes, proof, and a clear call to action.",
    priorities: ["conversion intent", "buyer relevance", "objection handling"],
    forbidden: ["manipulative pressure", "unsupported claims"],
  },
  technical: {
    voice: "Use exact technical language, explicit assumptions, and implementation-grade instructions.",
    priorities: ["precision", "testability", "edge-case coverage"],
    forbidden: ["hand-wavy abstractions", "ambiguous requirements"],
  },
};

type DetailSection = "objective" | "context" | "requirements" | "constraints" | "output" | "quality" | "edge-cases";

const detailProfiles: Record<
  "concise" | "balanced" | "detailed",
  {
    description: string;
    sectionSet: readonly DetailSection[];
    instructionCount: number;
    validationDepth: "minimal" | "standard" | "strict";
  }
> = {
  concise: {
    description: "Minimize verbosity. Keep only the essential instruction path.",
    sectionSet: ["objective", "context", "requirements", "output"] as const,
    instructionCount: 4,
    validationDepth: "minimal",
  },
  balanced: {
    description: "Balance brevity with enough context, constraints, and output guidance to reduce ambiguity.",
    sectionSet: ["objective", "context", "requirements", "constraints", "output", "quality"] as const,
    instructionCount: 6,
    validationDepth: "standard",
  },
  detailed: {
    description: "Expand the full contract with edge cases, validation checks, and execution guardrails.",
    sectionSet: ["objective", "context", "requirements", "constraints", "output", "quality", "edge-cases"] as const,
    instructionCount: 8,
    validationDepth: "strict",
  },
};

const formatProfiles = {
  plain: {
    outputInstruction: "Return plain text with clearly separated labeled sections.",
    renderer: (lines: string[]) => lines.join("\n"),
  },
  bullet: {
    outputInstruction: "Return the answer as concise bullet lists grouped by section.",
    renderer: (lines: string[]) => lines.map((line) => (line.startsWith("- ") ? line : `- ${line}`)).join("\n"),
  },
  markdown: {
    outputInstruction: "Return structured markdown with headings and concise lists.",
    renderer: (lines: string[]) => lines.join("\n"),
  },
  json: {
    outputInstruction: "Return valid JSON with stable keys and no commentary outside the object.",
    renderer: (lines: string[]) =>
      JSON.stringify(
        {
          objective: lines[0] ?? "",
          instructions: lines.slice(1, 5),
          validation: lines.slice(5),
        },
        null,
        2,
      ),
  },
  table: {
    outputInstruction: "Return markdown table-style output where useful, followed by concise notes if needed.",
    renderer: (lines: string[]) =>
      ["| Section | Instruction |", "| --- | --- |", ...lines.map((line, index) => `| ${index + 1} | ${escapePipes(line)} |`)].join(
        "\n",
      ),
  },
  steps: {
    outputInstruction: "Return the response as numbered execution steps.",
    renderer: (lines: string[]) => lines.map((line, index) => `${index + 1}. ${stripListMarker(line)}`).join("\n"),
  },
};

const modelProfiles: Record<string, string[]> = {
  chatgpt: [
    "Prioritize clear role + task framing before constraints.",
    "Make output easy to paste directly into ChatGPT.",
  ],
  claude: [
    "Prefer explicit reasoning boundaries and careful instruction hierarchy.",
    "Reduce ambiguity by specifying deliverable shape clearly.",
  ],
  gemini: [
    "Use concise section titles and direct formatting expectations.",
    "Keep the prompt modular so the model can preserve structure across long outputs.",
  ],
  midjourney: [
    "Emphasize subject, style, composition, lighting, camera feel, and exclusions.",
    "Compress instructions into image-model-friendly phrasing.",
  ],
  sora: [
    "Specify scene flow, camera movement, pacing, environment, and visual continuity.",
    "Include timing and cinematic constraints explicitly.",
  ],
  copilot: [
    "Bias toward implementation detail, code constraints, and acceptance criteria.",
    "Make the task executable with minimal follow-up clarification.",
  ],
  openclaw: [
    "Use explicit objective, constraints, and required output sections.",
    "Assume the system performs best with direct, structured commands.",
  ],
  other: [
    "Keep the prompt highly structured and model-agnostic.",
    "Favor explicit task contracts over provider-specific slang.",
  ],
};

const useCaseProfiles: Record<
  UseCaseCategory,
  {
    objectivePrefix: string;
    requirements: string[];
    qualityChecks: string[];
    deliverableFocus: string;
  }
> = {
  writing: {
    objectivePrefix: "Produce polished written material",
    requirements: ["preserve voice consistency", "maintain logical flow", "avoid filler and repetition"],
    qualityChecks: ["writing should read naturally", "each section should earn its place"],
    deliverableFocus: "clear written draft",
  },
  coding: {
    objectivePrefix: "Generate implementation-ready technical guidance",
    requirements: ["specify stack assumptions", "include edge cases", "make acceptance criteria testable"],
    qualityChecks: ["instructions should be executable", "technical ambiguity should be minimized"],
    deliverableFocus: "engineering-ready prompt",
  },
  marketing: {
    objectivePrefix: "Create conversion-aware marketing output",
    requirements: ["anchor to audience pain and value", "make CTA explicit", "avoid hype without proof"],
    qualityChecks: ["message should be channel-appropriate", "claims should remain credible"],
    deliverableFocus: "campaign-ready prompt",
  },
  research: {
    objectivePrefix: "Structure a reliable research task",
    requirements: ["define scope", "ask for synthesis not just collection", "request clear citations or evidence handling"],
    qualityChecks: ["sources should be comparable", "findings should be organized"],
    deliverableFocus: "research-ready prompt",
  },
  business: {
    objectivePrefix: "Generate decision-ready business output",
    requirements: ["clarify objective and tradeoffs", "highlight priorities", "request concise executive-ready framing"],
    qualityChecks: ["recommendations should be actionable", "business context should be explicit"],
    deliverableFocus: "business-ready prompt",
  },
  design: {
    objectivePrefix: "Produce design-aware creative direction",
    requirements: ["specify aesthetic goals", "define user or brand context", "request layout and visual hierarchy"],
    qualityChecks: ["direction should be visually coherent", "outputs should remain usable"],
    deliverableFocus: "design-direction prompt",
  },
  images: {
    objectivePrefix: "Craft a high-signal image generation prompt",
    requirements: ["define subject and composition", "specify visual style", "include negative constraints"],
    qualityChecks: ["visual cues should not conflict", "the image brief should be vivid and specific"],
    deliverableFocus: "image-model prompt",
  },
  video: {
    objectivePrefix: "Craft a cinematic video generation prompt",
    requirements: ["define scene sequence", "specify camera behavior", "include motion and pacing guidance"],
    qualityChecks: ["shots should feel coherent", "continuity and tone should hold through the sequence"],
    deliverableFocus: "video-model prompt",
  },
  agents: {
    objectivePrefix: "Define an agent instruction contract",
    requirements: ["set role and boundaries", "define tools and constraints", "specify success and refusal conditions"],
    qualityChecks: ["agent behavior should be predictable", "instructions should reduce drift"],
    deliverableFocus: "agent-system prompt",
  },
  productivity: {
    objectivePrefix: "Convert a rough task into a dependable execution prompt",
    requirements: ["clarify desired outcome", "reduce ambiguity", "specify practical output shape"],
    qualityChecks: ["the prompt should be fast to use", "the result should require fewer follow-ups"],
    deliverableFocus: "general-purpose prompt",
  },
};

function escapePipes(value: string) {
  return value.replace(/\|/g, "\\|");
}

function stripListMarker(value: string) {
  return value.replace(/^- /, "").trim();
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMultiline(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function splitDesiredStructure(value: string) {
  return value
    .split(/[>,;\n]/)
    .map((piece) => normalize(piece))
    .filter(Boolean);
}

function firstSentence(text: string) {
  const sentence = text.split(/[.!?]/)[0] ?? "";
  return normalize(sentence || text);
}

function objectiveFromSettings(settings: PromptSettings) {
  const useCase = useCaseProfiles[settings.useCase];

  if (normalize(settings.goal)) {
    return normalize(settings.goal);
  }

  if (normalize(settings.rawPrompt)) {
    return `${useCase.objectivePrefix}: ${firstSentence(settings.rawPrompt)}`;
  }

  return "Generate a sharper, execution-ready prompt.";
}

function buildAudienceLine(settings: PromptSettings) {
  if (normalize(settings.audience)) {
    return normalize(settings.audience);
  }

  return settings.useCase === "coding"
    ? "engineers or technical builders"
    : settings.useCase === "marketing"
      ? "prospects, buyers, or growth teams"
      : "a capable AI system acting on behalf of the user";
}

function buildConstraintList(settings: PromptSettings) {
  const supplied = settings.includeConstraints ? normalizeMultiline(settings.constraints) : "";
  const tone = toneProfiles[settings.tone] ?? toneProfiles.neutral;
  const useCase = useCaseProfiles[settings.useCase];

  return [
    supplied ? supplied : "Avoid unsupported assumptions and ask the model to stay within the supplied brief.",
    `Maintain ${settings.tone} tone with emphasis on ${tone.priorities.join(", ")}.`,
    `Avoid ${tone.forbidden.join(" and ")}.`,
    `Deliver a ${useCase.deliverableFocus} rather than generic filler.`,
  ].filter(Boolean);
}

function buildRequirementList(settings: PromptSettings, detailLevel: keyof typeof detailProfiles) {
  const useCase = useCaseProfiles[settings.useCase];
  const base = [
    `Primary objective: ${objectiveFromSettings(settings)}.`,
    `Target audience: ${buildAudienceLine(settings)}.`,
    `Output format: ${settings.outputFormat}.`,
    ...useCase.requirements.map((item) => `Requirement: ${item}.`),
  ];

  if (settings.includeContext && normalize(settings.context)) {
    base.push(`Context to preserve: ${normalizeMultiline(settings.context)}.`);
  }

  if (settings.includeExamples && normalize(settings.examples)) {
    base.push(`Use these examples as calibration points: ${normalizeMultiline(settings.examples)}.`);
  }

  if (detailLevel !== "concise") {
    base.push(`Desired structure order: ${splitDesiredStructure(settings.desiredStructure).join(" -> ") || "objective -> context -> requirements -> output"}.`);
  }

  if (detailLevel === "detailed") {
    base.push("Call out assumptions, edge cases, and validation checks before finalizing the response.");
  }

  return base;
}

function buildQualityChecks(settings: PromptSettings, detailLevel: keyof typeof detailProfiles) {
  const useCase = useCaseProfiles[settings.useCase];
  const checks = [
    ...useCase.qualityChecks,
    `final result must match ${settings.outputFormat} format`,
    `final result must feel ${settings.tone}, not generic`,
  ];

  if (detailLevel !== "concise") {
    checks.push("remove ambiguity before returning the final answer");
  }

  if (detailLevel === "detailed") {
    checks.push("include explicit failure cases or pitfalls where relevant");
    checks.push("make constraints testable rather than implied");
  }

  return checks;
}

function buildModelInstructions(settings: PromptSettings) {
  const model = modelProfiles[settings.targetModel] ?? modelProfiles.other;
  return model;
}

function buildBaseLines(settings: PromptSettings, detailLevel: keyof typeof detailProfiles) {
  const tone = toneProfiles[settings.tone] ?? toneProfiles.neutral;
  const detail = detailProfiles[detailLevel];
  const structure = splitDesiredStructure(settings.desiredStructure);
  const requirements = buildRequirementList(settings, detailLevel).slice(0, detail.instructionCount);
  const constraints = buildConstraintList(settings);
  const modelInstructions = buildModelInstructions(settings);
  const qualityChecks = buildQualityChecks(settings, detailLevel);

  const lines: string[] = [];

  lines.push(`# Promptify Refined Prompt`);
  lines.push(`## Objective`);
  lines.push(`- ${objectiveFromSettings(settings)}`);

  if (detail.sectionSet.includes("context")) {
    lines.push(`## Context`);
    lines.push(`- Original request: ${normalizeMultiline(settings.rawPrompt) || "(not provided)"}`);
    lines.push(`- Use case: ${settings.useCase}`);
    lines.push(`- Target model: ${settings.targetModel}`);
    lines.push(`- Audience: ${buildAudienceLine(settings)}`);
    if (settings.includeContext && normalize(settings.context)) {
      lines.push(`- Additional context: ${normalizeMultiline(settings.context)}`);
    }
  }

  lines.push(`## Tone and Style`);
  lines.push(`- ${tone.voice}`);
  lines.push(`- Priorities: ${tone.priorities.join(", ")}.`);

  lines.push(`## Requirements`);
  requirements.forEach((item) => lines.push(`- ${stripListMarker(item)}`));

  if (detail.sectionSet.includes("constraints")) {
    lines.push(`## Constraints`);
    constraints.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push(`## Output Contract`);
  lines.push(`- ${formatProfiles[settings.outputFormat].outputInstruction}`);
  lines.push(`- Detail level: ${detailLevel}. ${detail.description}`);
  lines.push(`- Return a result that is ready to copy into ${settings.targetModel}.`);

  lines.push(`## Model Framing`);
  modelInstructions.forEach((item) => lines.push(`- ${item}`));

  if (structure.length > 0) {
    lines.push(`## Preferred Structure`);
    structure.forEach((item, index) => lines.push(`- ${index + 1}. ${item}`));
  }

  if (detail.sectionSet.includes("quality")) {
    lines.push(`## Quality Checks`);
    qualityChecks.forEach((item) => lines.push(`- ${item}`));
  }

  if (detail.sectionSet.includes("edge-cases")) {
    lines.push(`## Edge Cases`);
    lines.push(`- Resolve missing assumptions before inventing specifics.`);
    lines.push(`- Preserve user intent even when adding structure or stronger constraints.`);
    lines.push(`- If the request is broad, prioritize a useful first-pass result over exhaustive coverage.`);
  }

  return lines;
}

function renderPrompt(settings: PromptSettings, detailLevel: keyof typeof detailProfiles) {
  const lines = buildBaseLines(settings, detailLevel);
  return formatProfiles[settings.outputFormat].renderer(lines);
}

function buildStructuredPrompt(settings: PromptSettings) {
  const lines = [
    "# Structured Prompt Package",
    `## Objective`,
    `- ${objectiveFromSettings(settings)}`,
    "## Inputs",
    `- Use case: ${settings.useCase}`,
    `- Audience: ${buildAudienceLine(settings)}`,
    `- Target model: ${settings.targetModel}`,
    `- Original request: ${normalizeMultiline(settings.rawPrompt) || "(not provided)"}`,
    settings.includeContext && normalize(settings.context) ? `- Context: ${normalizeMultiline(settings.context)}` : null,
    "## Prompt",
    renderPrompt(settings, settings.detailLevel),
  ].filter(Boolean);

  return lines.join("\n");
}

function buildSystemPrompt(settings: PromptSettings) {
  const tone = toneProfiles[settings.tone] ?? toneProfiles.neutral;
  const useCase = useCaseProfiles[settings.useCase];
  return [
    `You are an expert ${settings.useCase} prompt executor.`,
    `Primary objective: ${objectiveFromSettings(settings)}.`,
    `Voice: ${tone.voice}`,
    `Deliverable focus: ${useCase.deliverableFocus}.`,
    `Follow these priorities: ${tone.priorities.join(", ")}.`,
    `Avoid: ${tone.forbidden.join(", ")}.`,
  ].join("\n");
}

function buildUserPrompt(settings: PromptSettings) {
  return [
    `Original request: ${normalizeMultiline(settings.rawPrompt) || "(not provided)"}`,
    settings.includeContext && normalize(settings.context) ? `Context: ${normalizeMultiline(settings.context)}` : null,
    normalize(settings.goal) ? `Goal: ${normalize(settings.goal)}` : null,
    normalize(settings.audience) ? `Audience: ${normalize(settings.audience)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDeveloperPrompt(settings: PromptSettings) {
  const checks = buildQualityChecks(settings, settings.detailLevel).slice(0, 4);
  return [
    "Improve structure without changing user intent.",
    `Bias toward ${settings.detailLevel} detail and ${settings.outputFormat} output.`,
    `Make the result feel ${settings.tone} and tuned for ${settings.targetModel}.`,
    `Before finalizing, verify: ${checks.join("; ")}.`,
  ].join(" ");
}

function promptVariants(settings: PromptSettings): PromptOutputVariant[] {
  const conciseSettings = { ...settings, detailLevel: "concise" as const, tone: settings.tone };
  const detailedSettings = { ...settings, detailLevel: "detailed" as const, tone: settings.tone };
  const improvedSettings = { ...settings, detailLevel: settings.detailLevel };
  const variantASettings = { ...settings, tone: "sales" as const, detailLevel: "balanced" as const };
  const variantBSettings = { ...settings, tone: "technical" as const, detailLevel: "detailed" as const };
  const modelSettings = { ...settings, detailLevel: "balanced" as const };

  return [
    {
      id: createId("variant"),
      label: "Concise",
      prompt: renderPrompt(conciseSettings, "concise"),
      rationale: ["Compresses the instruction path", "Keeps only essential requirements", "Optimized for quick execution"],
    },
    {
      id: createId("variant"),
      label: "Detailed",
      prompt: renderPrompt(detailedSettings, "detailed"),
      rationale: ["Expands constraints and validation", "Adds edge cases and stronger guardrails", "Improves reliability for longer tasks"],
    },
    {
      id: createId("variant"),
      label: "Improved",
      prompt: renderPrompt(improvedSettings, settings.detailLevel),
      rationale: ["Aligned to selected tone", "Tailored to selected use case", "Built from the current settings contract"],
    },
    {
      id: createId("variant"),
      label: "Variant A",
      prompt: renderPrompt(variantASettings, "balanced"),
      rationale: ["Shifts toward persuasion and outcome framing", "Stronger CTA and buyer relevance", "Useful for conversion-focused tasks"],
    },
    {
      id: createId("variant"),
      label: "Variant B",
      prompt: renderPrompt(variantBSettings, "detailed"),
      rationale: ["Shifts toward implementation precision", "Tightens ambiguity and assumptions", "Useful for technical or operational workflows"],
    },
    {
      id: createId("variant"),
      label: `Model: ${settings.targetModel}`,
      prompt: renderPrompt(modelSettings, "balanced"),
      rationale: ["Adjusts instruction ordering for the selected model", "Adds model-specific framing", "Keeps the prompt copy-ready for the destination tool"],
      isModelSpecific: true,
    },
  ];
}

export function collectQualitySignals(settings: PromptSettings): string[] {
  const flags: string[] = [];

  if (!normalize(settings.goal)) {
    flags.push("Goal was inferred from the raw prompt.");
  }

  if (!settings.includeContext || !normalize(settings.context)) {
    flags.push("Context was limited, so the engine kept assumptions conservative.");
  }

  if (!settings.includeConstraints || !normalize(settings.constraints)) {
    flags.push("Default execution constraints were added to reduce drift.");
  }

  if (!normalize(settings.audience)) {
    flags.push("Audience was inferred broadly and kept general-purpose.");
  }

  if (settings.detailLevel === "detailed") {
    flags.push("Detailed mode expanded validation and edge-case handling.");
  }

  if (settings.outputFormat === "json") {
    flags.push("Output contract was tightened for machine-readable structure.");
  }

  return flags;
}

export function estimateQualityScore(settings: PromptSettings): number {
  let score = 32;

  if (normalize(settings.goal)) score += 10;
  if (normalize(settings.rawPrompt) && settings.rawPrompt.length > 40) score += 8;
  if (settings.includeContext && normalize(settings.context)) score += 12;
  if (normalize(settings.audience)) score += 8;
  if (settings.includeConstraints && normalize(settings.constraints)) score += 10;
  if (settings.includeExamples && normalize(settings.examples)) score += 8;
  if (settings.detailLevel === "balanced") score += 5;
  if (settings.detailLevel === "detailed") score += 10;
  if (settings.outputFormat !== "plain") score += 5;
  if (settings.useCase) score += 6;
  if (settings.targetModel) score += 6;

  return Math.max(0, Math.min(100, score));
}

function buildRationale(settings: PromptSettings): PromptDiffPoint[] {
  return [
    {
      label: "Objective clarified",
      note: `Reframed the request as a concrete objective: ${objectiveFromSettings(settings)}.`,
    },
    {
      label: "Use-case specialization",
      note: `Applied ${settings.useCase} workflow defaults so the prompt is not generic.`,
    },
    {
      label: "Tone shaping",
      note: `Adjusted voice and priorities for a ${settings.tone} result.`,
    },
    {
      label: "Output contract",
      note: `Rebuilt the prompt around ${settings.outputFormat} output with ${settings.detailLevel} depth.`,
    },
    {
      label: "Model framing",
      note: `Added model-aware instructions for ${settings.targetModel}.`,
    },
  ];
}

function buildDiff(settings: PromptSettings): PromptDiffPoint[] {
  return [
    {
      label: "Input normalized",
      note: "Spacing, instruction boundaries, and intent were cleaned for deterministic processing.",
    },
    {
      label: "Goal extracted",
      note: objectiveFromSettings(settings),
    },
    {
      label: "Context enrichment",
      note: settings.includeContext && normalize(settings.context)
        ? `Preserved contextual inputs: ${normalize(settings.context)}.`
        : "Kept context conservative because little or no context was supplied.",
    },
    {
      label: "Constraint tightening",
      note: buildConstraintList(settings).slice(0, 2).join(" "),
    },
    {
      label: "Output redesign",
      note: `The resulting prompt now changes materially by tone, detail, model target, and requested format.`,
    },
  ];
}

export async function runHeuristicEngine(input: PromptGenerationInput): Promise<PromptGenerationResult> {
  const settings = input.settings;
  const basePrompt = renderPrompt(settings, settings.detailLevel);
  const variants = promptVariants(settings);
  const rationaleSummary = buildRationale(settings).map((entry) => `${entry.label}: ${entry.note}`);
  const qualityScore = estimateQualityScore(settings);
  const qualityFlags = collectQualitySignals(settings);

  const output: PromptOutput = {
    id: createId("output"),
    sourceSettingsId: settings.id,
    createdAt: new Date().toISOString(),
    basePrompt,
    qualityScore,
    qualityFlags,
    variants,
    structuredPrompt: buildStructuredPrompt(settings),
    systemPrompt: buildSystemPrompt(settings),
    userPrompt: buildUserPrompt(settings),
    developerPrompt: buildDeveloperPrompt(settings),
    rationaleSummary,
  };

  return {
    output,
    diff: buildDiff(settings),
  };
}
