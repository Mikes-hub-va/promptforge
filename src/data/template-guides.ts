import { USE_CASE_LABELS } from "@/data/constants";
import { PRESET_LIBRARY } from "@/data/presets";

export type TemplateGuide = {
  slug: string;
  title: string;
  description: string;
  category: "writing" | "coding" | "business" | "design" | "images" | "video" | "agents" | "marketing" | "productivity" | "research";
  summary: string;
  audience: string;
  useCase: string;
  recommendations: string[];
};

export const TEMPLATE_GUIDES: TemplateGuide[] = [
  {
    slug: "coding",
    title: "Prompt Templates for Coding",
    description: "Turn feature ideas into implementation-ready prompts for coding assistants and coding LLMs.",
    category: "coding",
    summary:
      "Use structured tasks, expected outputs, and edge-case checks so generated code is less likely to drift from your target behavior.",
    audience: "Engineers, technical founders, and dev teams",
    useCase: USE_CASE_LABELS.coding,
    recommendations: [
      "Always include constraints for stack, testing requirements, and acceptance criteria.",
      "Use the structured model-specific variant for multi-step workflows.",
      "Keep examples minimal and realistic to avoid prompt over-constraint.",
    ],
  },
  {
    slug: "marketing",
    title: "Prompt Templates for Marketing",
    description: "Generate launch messaging, campaign copy, and positioning prompts with consistent voice controls.",
    category: "marketing",
    summary:
      "The strongest prompts include audience, intent, proof points, and CTA structure before calling any model.",
    audience: "Marketers, founders, growth teams",
    useCase: USE_CASE_LABELS.marketing,
    recommendations: [
      "Anchor every request to outcome + channel + format before content type.",
      "Turn vague brand claims into concrete proof or evidence requests.",
      "Use concise detail for social prompts and detailed mode for campaign frameworks.",
    ],
  },
  {
    slug: "content-writing",
    title: "Prompt Templates for Content Writing",
    description: "Write polished articles, newsletters, and long-form content with consistent structure and editorial continuity.",
    category: "writing",
    summary:
      "Promptify helps enforce format and hierarchy, making long-form content easier to reuse across publishing workflows.",
    audience: "Creators, PMs, editors, and operations teams",
    useCase: USE_CASE_LABELS.writing,
    recommendations: [
      "Define the target reader and reading level up front.",
      "Add metadata goals such as keyword intent and CTA expectations.",
      "Use structured mode for outline-first drafts before final polish.",
    ],
  },
  {
    slug: "app-building",
    title: "Prompt Templates for App Building",
    description: "Create repeatable prompts for PRDs, sprint plans, and implementation guidance for AI coding workflows.",
    category: "business",
    summary:
      "App prompts work best with milestone constraints, dependencies, and explicit outputs in the right order.",
    audience: "Product teams and technical operators",
    useCase: USE_CASE_LABELS.business,
    recommendations: [
      "Define scope boundaries and release assumptions before model output.",
      "Ask for explicit handoff format: requirements, risks, dependencies, test plan.",
      "Keep detail level set to detailed for first drafts.",
    ],
  },
  {
    slug: "image-generation",
    title: "Prompt Templates for Image Generation",
    description: "Craft visual prompts with composition, style, and production constraints for Midjourney / image models.",
    category: "images",
    summary:
      "Consistency is improved by separating subject, composition, lighting, ratio, and avoid-constraints into explicit blocks.",
    audience: "Designers, brand teams, and creators",
    useCase: USE_CASE_LABELS.images,
    recommendations: [
      "Pick exactly one visual language style before adding details.",
      "Include lighting and ratio constraints in the first pass.",
      "Avoid conflicting negative constraints and test one variation at a time.",
    ],
  },
];

export const TEMPLATE_GUIDE_BY_SLUG = TEMPLATE_GUIDES.reduce<Record<string, TemplateGuide>>((acc, guide) => {
  acc[guide.slug] = guide;
  return acc;
}, {});

export function templatesForGuide(slug: string) {
  const category = TEMPLATE_GUIDE_BY_SLUG[slug]?.category;
  if (!category) {
    return [];
  }
  return PRESET_LIBRARY.filter((preset) => preset.category === category);
}
