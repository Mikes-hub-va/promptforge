import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATE_GUIDE_BY_SLUG, templatesForGuide } from "@/data/template-guides";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamicParams = true;

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = TEMPLATE_GUIDE_BY_SLUG[slug];
  return {
    title: guide ? guide.title : "Template Guide",
    description: guide?.summary,
  };
}

export async function generateStaticParams() {
  return Object.keys(TEMPLATE_GUIDE_BY_SLUG).map((slug) => ({ slug }));
}

export default async function ResourceGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = TEMPLATE_GUIDE_BY_SLUG[slug];

  if (!guide) {
    notFound();
  }

  const guides = templatesForGuide(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title={guide.title} kicker="Template guide" description={guide.description} />
      <p className="mt-3 max-w-2xl text-sm text-slate-600">{guide.summary}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-4">Audience: {guide.audience}</p>

      <div className="mt-8 space-y-4">
        {guide.recommendations.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-sm">Recommendation</CardTitle>
              <CardDescription>{item}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Recommended presets</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {guides.length ? (
            guides.map((preset) => (
              <Card key={preset.id}>
                <CardHeader>
                  <CardTitle>{preset.title}</CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p>Use case: {guide.useCase}</p>
                  <p>Style: {preset.outputStyle}</p>
                  <Link href={`/workspace?preset=${preset.slug}`} className="inline-block underline">
                    Forge with this preset
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-500">No dedicated presets yet, but we are adding more each sprint.</p>
          )}
        </div>
      </div>
    </div>
  );
}
