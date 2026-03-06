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
cd /Users/michael_isa_ai_test/Documents/New project/promptforge
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

No provider key is required for the MVP.

Optional future provider variables are intentionally reserved for the extension point:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

If set, the app is already wired to choose a provider adapter via `createPromptProvider()`, with a TODO to add actual adapters.

## Provider abstraction

The prompt engine is split into three layers:

1. `lib/prompt-engine/heuristic.ts` – deterministic local engine (default)
2. `lib/prompt-engine/provider.ts` – provider selection and interface
3. `lib/prompt-engine/types.ts` – shared generation contracts

To add a real LLM provider, implement a `PromptEnhancer` in `provider.ts` and switch `createPromptProvider()` to route to the new implementation when the env key is present.

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
