import { SectionHeading } from "@/components/marketing/section-heading";

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title="Changelog" description="Product updates and improvements." />
      <div className="mt-8 space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">2026-03-05</p>
          <h2 className="mt-2 text-lg font-semibold">v1.0.0 Launch</h2>
          <p className="mt-2 text-sm text-slate-700">Introduced workspace, local prompt refinement engine, templates, save/history, pricing, and legal pages.</p>
        </article>
      </div>
    </div>
  );
}
