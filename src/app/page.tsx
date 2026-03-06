import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeroHeader, SectionHeading } from "@/components/marketing/section-heading";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PromptForgePreview } from "@/components/marketing/hero-preview";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ProductMark } from "@/components/navigation/site-nav";
import { Card, CardContent } from "@/components/ui/card";
import { FAQ_ITEMS } from "@/data/constants";
import { PRESET_LIBRARY } from "@/data/presets";

const topTemplates = PRESET_LIBRARY.slice(0, 6);

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 md:px-8 md:pt-20 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <div>
            <ProductMark label="Prompt engineering without the headache" />
            <HeroHeader
              title="Turn rough ideas into precise, high-performing AI prompts."
              description="PromptForge refines a messy idea into a structured, copy-ready prompt with built-in variants, model-aware formatting, and rationale for every refinement."
              cta={
                <>
                  <Button asChild>
                    <Link href="/workspace">Start Forging</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/templates">Browse Templates</Link>
                  </Button>
                </>
              }
              secondary={<span className="inline-flex items-center gap-1"> <Sparkles className="h-4 w-4" /> Built for ChatGPT, Claude, Gemini, Midjourney, and beyond</span>}
            />
            <div className="mt-8 grid gap-3 text-sm text-slate-700">
              <p>• From rough prompt to production-ready instruction in seconds</p>
              <p>• Compare original vs improved output with rationale</p>
              <p>• Save, duplicate, and restore prompt drafts instantly</p>
            </div>
          </div>

          <PromptForgePreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <SectionHeading
          kicker="Features"
          title="A premium but practical workspace"
          description="Built for everyday creators and advanced users, PromptForge keeps the workflow clear and high signal."
        />
        <div className="mt-8"><FeatureGrid /></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <SectionHeading
          kicker="Use Case Templates"
          title="Start with a preset that matches your task"
          description="Choose from coding, marketing, SEO writing, image prompts, app specs, and more."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topTemplates.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow"
            >
              <p className="text-sm text-slate-500">{template.icon}</p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{template.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{template.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8" id="before-after">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardContent className="p-6">
              <p className="text-sm uppercase tracking-widest text-slate-500">Original</p>
              <p className="mt-4 text-sm text-slate-700">&quot;Need to write a launch email and social copy, but I am not sure what to include&quot;</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm uppercase tracking-widest text-slate-500">Improved</p>
              <p className="mt-4 text-sm text-slate-700">&quot;Goal: craft aligned product announcement assets for launch communication across email and social. Audience: early-access users. Constraints: 120 words email, 2 posts, brand-voice upbeat but factual. Output: 1) email draft 2) social script variants 3) success checklist&quot;</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <SectionHeading
          kicker="Pricing"
          title="Built for shipping, ready to scale"
          description="Start with the free tier and upgrade later as you grow your prompt workflows."
        />
        <div className="mt-8"><PricingCards /></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <SectionHeading
          kicker="FAQ"
          title="Trusted Product Basics"
          description="Clear answers for common questions while you get started."
        />
        <div className="mt-8">
          <Accordion
            items={FAQ_ITEMS.map((item) => ({
              question: item.question,
              answer: <p>{item.answer}</p>,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
