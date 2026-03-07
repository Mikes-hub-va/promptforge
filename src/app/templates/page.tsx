import type { Metadata } from "next";
import Link from "next/link";
import { PRESET_LIBRARY } from "@/data/presets";
import { TemplateLibrary } from "@/components/marketing/template-library";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Templates",
  description: "Starter prompt presets for coding, writing, marketing, and AI models.",
};

export default function TemplatesPage() {
  const topTemplates = PRESET_LIBRARY.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Prompt Templates"
        kicker="Promptify"
        description="Pick a preset and start from a proven structure rather than a blank canvas."
      />
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Popular starts</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topTemplates.map((preset) => (
            <Link
              key={preset.id}
              href={`/templates/${preset.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:shadow"
            >
              {preset.icon} <span className="font-medium text-slate-900">{preset.title}</span> • {preset.outputStyle}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <TemplateLibrary />
      </div>
    </div>
  );
}
