import { FAQItem, NavItem, Plan, UseCaseCategory } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/templates", label: "Templates" },
  { href: "/resources", label: "Resources" },
  { href: "/workspace", label: "Workspace" },
  { href: "/saved", label: "Saved" },
  { href: "/history", label: "History" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export const FEATURE_HIGHLIGHTS = [
  {
    title: "From rough draft to execution-ready",
    description:
      "Promptify turns vague briefs into clear, constrained prompt packs that are easier to trust and easier to ship.",
  },
  {
    title: "Built for operator workflows",
    description:
      "Coding, content, research, specs, image prompting, and launch copy all get their own tuned starting points.",
  },
  {
    title: "Flexible runtime paths",
    description:
      "Guest mode works instantly. BYOK works for everyone. Pro adds a managed cloud runtime for teams that want less setup overhead.",
  },
];

export const MODEL_OPTIONS = [
  { value: "chatgpt", label: "ChatGPT / GPT-5" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "midjourney", label: "Midjourney" },
  { value: "sora", label: "Sora" },
  { value: "copilot", label: "Microsoft Copilot" },
  { value: "openclaw", label: "OpenClaw" },
  { value: "other", label: "Custom / Other" },
];

export const PROVIDER_OPTIONS = [
  { value: "local", label: "Local engine only" },
  { value: "openai", label: "OpenAI / OpenRouter-compatible" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google AI (Gemini)" },
] as const;

export const PROVIDER_MODELS: Record<(typeof PROVIDER_OPTIONS)[number]["value"], string[]> = {
  local: ["local-heuristic"],
  openai: [
    "openai/gpt-oss-20b",
    "google/gemini-2.0-flash-lite-001",
    "gpt-4o-mini",
    "gpt-4.1-mini",
    "gpt-4.1",
    "gpt-4o",
    "gpt-4.1-nano",
  ],
  anthropic: ["claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus-20240229"],
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
};

export const PROVIDER_COST_NOTES = {
  free: "No API call is required in local mode.",
  localOnly: "Runs entirely in your browser via deterministic refinement.",
} as const;

export const USE_CASE_LABELS: Record<UseCaseCategory, string> = {
  writing: "Content Writing",
  coding: "Coding",
  marketing: "Marketing",
  research: "Research",
  business: "Business",
  design: "Design",
  images: "Image Generation",
  video: "Video Generation",
  agents: "Agent Instructions",
  productivity: "Productivity",
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    handle: "for solo builders, prototyping, and first passes",
    subtitle: "Full local workspace with real account sync",
    accent: "Guest + account",
    price: "$0",
    frequency: "/month",
    monthlyPromptRuns: 0,
    aiMonthlyRuns: 0,
    aiModel: "Local-only heuristic engine",
    estimatedModelCostUsd: 0,
    estimatedProviderRunCostUsd: 0,
    description:
      "Start in guest mode or create an account. Local prompt shaping is free, synced history is real, and BYOK stays available without a paywall.",
    features: [
      "Local prompt refinement and structured prompt packs",
      "Account creation with synced saved prompts and history",
      "BYOK provider access with session-only keys",
      "Template library, quick starts, and export tools",
      "No credit card required",
      "Best fit for everyday prompt drafting",
    ],
    cta: "Start free",
    ctaHint: "Guest mode or account mode",
  },
  {
    id: "pro",
    name: "Promptify Pro",
    handle: "for daily operators who want managed runs without runaway spend",
    subtitle: "Real billing, low-cost OpenRouter runs, and unlimited BYOK",
    accent: "Managed plan",
    price: "$12",
    frequency: "/month",
    monthlyPromptRuns: 0,
    aiMonthlyRuns: 0,
    aiModel: "Promptify Cloud on OpenRouter low-cost models + BYOK",
    estimatedModelCostUsd: 0.12,
    estimatedProviderRunCostUsd: 0.12,
    highlight: true,
    description:
      "Keep the local workspace, keep unlimited BYOK, and add a managed cloud runtime so the product works without asking users for keys every time.",
    features: [
      "Stripe-backed account billing",
      "Managed cloud runs on low-cost OpenRouter models",
      "Unlimited BYOK runs across OpenAI, Anthropic, and Gemini",
      "Comparison tabs and model-targeted output packs",
      "Synced library, saved history, and quick duplicate flow",
      "Priority product support",
    ],
    cta: "Upgrade to Pro",
    ctaHint: "Managed runs unlock here",
  },
  {
    id: "team",
    name: "Studio",
    handle: "for teams standardizing prompt quality across a real workflow",
    subtitle: "Concierge onboarding and shared governance",
    accent: "Contact sales",
    price: "Custom",
    frequency: "",
    monthlyPromptRuns: 0,
    aiMonthlyRuns: 0,
    aiModel: "Promptify Cloud + BYOK",
    estimatedModelCostUsd: 3.6,
    estimatedProviderRunCostUsd: 3.6,
    description:
      "For teams that need shared templates, review flow, and a rollout path instead of a handful of solo prompt drafts.",
    features: [
      "Shared workspace standards and template governance",
      "Team onboarding and rollout help",
      "Review flow for prompt quality and reuse",
      "Private workspace onboarding and governance setup",
    ],
    cta: "Talk to us",
    ctaHint: "Concierge only",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Do I need an API key to use Promptify?",
    answer:
      "No. Starter accounts can work entirely in local mode. BYOK is available when you want it, and Pro can unlock managed cloud runs when the server-side provider key is configured.",
  },
  {
    question: "How are prompts improved?",
    answer:
      "Promptify uses a deterministic prompt engine first, then optionally routes through a real provider for paid managed runs or user-supplied BYOK requests.",
  },
  {
    question: "Can I generate multiple versions?",
    answer:
      "Yes. Each generation includes concise, balanced, detailed, and model-aware alternatives, plus a structured variant with rationale.",
  },
  {
    question: "Is data sent anywhere?",
    answer:
      "Guest mode stores data locally. Signed-in accounts sync saved prompts and history to the app database, and managed or BYOK provider runs are sent only to the selected model provider when invoked.",
  },
  {
    question: "Can I export prompts?",
    answer:
      "Yes, copy as plain text, markdown, or download as TXT/MD from the output panel.",
  },
];

export const APP_DOMAIN = "https://usepromptify.org";
