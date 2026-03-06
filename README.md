# PromptForge

PromptForge is a Next.js 16 App Router web app that converts rough or under-specified prompt ideas into structured, high-quality prompts for AI systems.

The MVP is intentionally fully functional without any external API key using a deterministic prompt-engine that adds structure, constraints, and multiple variants.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style shared UI components
- React Hook Form + Zod
- localStorage-backed persistence
- ESLint + TypeScript strictness for production-safe code

## Features Included

- Polished SaaS landing page
  - Hero, CTA, feature grid, social-proof placeholders, use-case examples, FAQ, pricing section
- Workspace (`/workspace`)
  - Raw prompt and goal inputs
  - Target model/use-case/tone/output format/detail controls
  - Optional context/constraints/examples toggles
  - Template preset application
  - Deterministic refine engine
  - Multiple variants: improved, concise, detailed, variant A/B, model-specific
  - Compare view vs original with rationale summary
  - Copy and export as `.txt`/`.md`
- Templates (`/templates`)
  - Multiple seeded presets across writing, coding, marketing, images, and agents
  - Per-template detail pages
- Saved prompts and history
  - `/saved`: rename, duplicate, delete, favorite, copy
  - `/history`: restore previous generations
- SEO-ready
  - Metadata + canonical + OG/Twitter cards via `layout.tsx`
  - `robots.txt`
  - `sitemap.xml` (includes template routes)
- Basic legal/product pages
  - `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/changelog`
- Vercel-friendly architecture
  - Server/client boundaries aligned with App Router
  - No database required for MVP

## Project structure

- `app/` – routes and route-level metadata
- `components/marketing` – landing page and content blocks
- `components/workspace` – workspace and prompt workflow components
- `components/navigation` – header/footer
- `components/ui` – reusable UI primitives
- `lib/prompt-engine` – deterministic prompt refinement and provider abstraction
- `lib/storage` – localStorage abstraction and global store
- `components/seo` – JSON-LD helper
- `data/` – constants and seeded presets
- `types/` – shared application types

## Local development

```bash
cd /path/to/promptforge
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build and quality checks

```bash
npm run lint
npm run build
```

Both are expected to pass before release.

## Environment variables

You can run MVPs with no provider key.

- `OPENAI_API_KEY` (optional): enables backend AI mode via `POST /api/promptforge/generate`.
- `OPENAI_PROMPT_MODEL` (optional): model selector (default `gpt-4o-mini`).
- `NEXT_PUBLIC_PROMPTFORGE_ENGINE_MODE` (optional): `"auto" | "heuristic" | "provider"`  
  - `auto` uses AI when `OPENAI_API_KEY` exists, otherwise falls back to heuristic.
  - `heuristic` forces deterministic local mode.
  - `provider` prefers AI mode.

`ANTHROPIC_API_KEY` remains reserved for future adapter support.

## Provider architecture

The engine now uses a real backend generation path:

1. Client submits settings to `POST /api/promptforge/generate`.
2. Server route resolves provider mode using available keys.
3. If enabled and healthy, requests are sent to OpenAI and returned as structured `PromptOutput`.
4. On error or absent keys, the deterministic fallback in `lib/prompt-engine/heuristic.ts` is used.

The existing provider abstraction in `lib/prompt-engine/provider.ts` is preserved and now points to `runOpenAIProvider` when keys are available.

## Pricing economics

Plans expose explicit run budgets and provider cost assumptions in `src/data/constants.ts`:
- Free: 250 local runs/mo, no AI calls.
- Pro: 2,500 runs/mo, AI-assisted with the same cap.

Current cost assumption used in docs:
- `gpt-4o-mini`, ~1500 tokens average per run (input+output).
- Estimated monthly AI cost for Pro is modeled around ~$1.40 at max plan utilization, leaving broad margin at $9.00/mo.

## Storage model

Persistence is local-only through browser storage for now:

- `/saved` stores polished prompts as `SavedPrompt`
- `/history` stores recent generations
- Storage interface is intentionally isolated (`lib/storage/localStorage.ts`, `lib/storage/manager.tsx`) for future migration to auth/database.

## Route map

- `/` landing page
- `/workspace` prompt builder and output experience
- `/templates` presets index
- `/templates/[slug]` preset details
- `/saved` saved draft manager
- `/history` recent generations
- `/pricing`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/changelog`

## Vercel deployment

PromptForge is deployable directly from GitHub to Vercel.

```bash
# from repo root
npm install
npm run build
```

Recommended Vercel settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

## Updating branding or adding templates

- Brand/copy: edit `app/layout.tsx`, `src/components/navigation/site-nav.tsx`, and landing components under `components/marketing`.
- Add new presets: edit `data/presets.ts` with the same `TemplatePreset` shape.
- Add new pages: create folders/files under `app/` with matching metadata and content blocks.

## Notes

- This repository is production-oriented for MVP and can be extended with authentication, billing, and real LLM providers without changing the front-door workspace flow.
