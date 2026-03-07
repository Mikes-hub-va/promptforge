import Link from "next/link";
import { notFound } from "next/navigation";
import { PRESET_LIBRARY, PRESET_SLUG_MAP } from "@/data/presets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TextQuote } from "lucide-react";

export const dynamicParams = true;

export function generateStaticParams() {
  return PRESET_LIBRARY.map((preset) => ({ slug: preset.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preset = PRESET_SLUG_MAP[slug];
  return {
    title: preset ? preset.title : "Template",
    description: preset?.description ?? "Prompt template details",
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preset = PRESET_SLUG_MAP[slug];

  if (!preset) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title={preset.title} description={preset.description} kicker="Template" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Default setup</CardTitle>
            <CardDescription>Recommended settings to get fast quality output for this prompt archetype.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p><strong>Use case:</strong> {preset.category}</p>
            <p><strong>Tone:</strong> {preset.recommendedFields.tone ?? "Balanced"}</p>
            <p><strong>Output format:</strong> {preset.recommendedFields.outputFormat ?? "markdown"}</p>
            <p><strong>Default structure:</strong> {preset.outputStyle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Starter prompt</CardTitle>
            <CardDescription>Example to start faster</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,250,0.9))] p-4 text-sm leading-6 text-slate-800">
              {preset.exampleInputs.rawPrompt}
            </pre>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              <TextQuote className="h-3.5 w-3.5" />
              Use this prompt in the workspace to auto-fill every field.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Link href={`/workspace?preset=${preset.slug}`}>
          <Button className="w-full">Forge this template now</Button>
        </Link>
        <Link href="/saved">
          <Button variant="outline" className="w-full">Browse saved prompts</Button>
        </Link>
      </div>
    </div>
  );
}
