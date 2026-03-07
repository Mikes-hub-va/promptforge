import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);
const timestampSchema = z.string().trim().min(1).max(64);
const shortTextSchema = z.string().trim().min(1).max(120);
const mediumTextSchema = z.string().trim().max(5000);
const longTextSchema = z.string().trim().max(30000);

export const promptSettingsSchema = z.object({
  id: idSchema,
  rawPrompt: longTextSchema.default(""),
  goal: mediumTextSchema.default(""),
  targetModel: z.string().trim().min(1).max(120).default("chatgpt"),
  useCase: z.enum([
    "writing",
    "coding",
    "marketing",
    "research",
    "business",
    "design",
    "images",
    "video",
    "agents",
    "productivity",
  ]),
  tone: z.enum([
    "neutral",
    "professional",
    "friendly",
    "authoritative",
    "creative",
    "minimal",
    "sales",
    "technical",
  ]),
  outputFormat: z.enum(["plain", "bullet", "markdown", "json", "table", "steps"]),
  detailLevel: z.enum(["concise", "balanced", "detailed"]),
  includeContext: z.boolean(),
  context: mediumTextSchema.default(""),
  audience: z.string().trim().max(200).default(""),
  includeConstraints: z.boolean(),
  constraints: mediumTextSchema.default(""),
  includeExamples: z.boolean(),
  examples: mediumTextSchema.default(""),
  desiredStructure: z.string().trim().max(1000).default(""),
  templateId: idSchema.optional(),
});

export const promptOutputVariantSchema = z.object({
  id: idSchema,
  label: shortTextSchema,
  prompt: longTextSchema,
  rationale: z.array(z.string().trim().max(500)).max(12).default([]),
  isModelSpecific: z.boolean().optional(),
});

export const promptOutputSchema = z.object({
  id: idSchema,
  sourceSettingsId: idSchema,
  createdAt: timestampSchema,
  basePrompt: longTextSchema,
  qualityScore: z.number().min(0).max(100).optional(),
  qualityFlags: z.array(z.string().trim().max(160)).max(24).optional(),
  variants: z.array(promptOutputVariantSchema).max(12),
  structuredPrompt: longTextSchema,
  systemPrompt: longTextSchema,
  userPrompt: longTextSchema,
  developerPrompt: longTextSchema.optional(),
  rationaleSummary: z.array(z.string().trim().max(500)).max(12),
});

export const savedPromptSchema = z.object({
  id: idSchema,
  source: z.enum(["local", "account"]).optional().default("account"),
  name: z.string().trim().min(1).max(160),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  tags: z.array(z.string().trim().min(1).max(48)).max(24).default([]),
  isStarred: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  folder: z.string().trim().min(1).max(80).optional(),
  settings: promptSettingsSchema,
  output: promptOutputSchema,
});

export const savedPromptPatchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  tags: z.array(z.string().trim().min(1).max(48)).max(24).optional(),
  isStarred: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  folder: z.union([z.string().trim().min(1).max(80), z.null()]).optional(),
  settings: promptSettingsSchema.optional(),
  output: promptOutputSchema.optional(),
});

export const historyEntrySchema = z.object({
  id: idSchema,
  createdAt: timestampSchema,
  settings: promptSettingsSchema,
  output: promptOutputSchema,
});

export const historyEntriesSchema = z.object({
  entries: z.array(historyEntrySchema).max(100).default([]),
});

export const promptStoreSyncSchema = z.object({
  savedPrompts: z.array(savedPromptSchema).max(100).default([]),
  history: z.array(historyEntrySchema).max(100).default([]),
});
