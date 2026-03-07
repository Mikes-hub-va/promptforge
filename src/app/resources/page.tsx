import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATE_GUIDES } from "@/data/template-guides";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Resource Center",
  description: "SEO-friendly prompt template pages by use case with practical recommendations.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Prompt Template Resource Center"
        kicker="Promptify"
        description="Searchable, structured prompt templates for specific workflows."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {TEMPLATE_GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/resources/${guide.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Prompt Templates</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{guide.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{guide.description}</p>
            <p className="mt-3 text-xs text-slate-500">{guide.audience}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
