import Link from "next/link";
import { notFound } from "next/navigation";
import { PRESET_LIBRARY, PRESET_SLUG_MAP } from "@/data/presets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketing/section-heading";

export function generateStaticParams() {
  return PRESET_LIBRARY.map((preset) => ({ slug: preset.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const preset = PRESET_SLUG_MAP[params.slug];
  return {
    title: preset ? `${preset.title} | PromptForge Template` : "Template | PromptForge",
    description: preset?.description ?? "Prompt template details",
  };
}

export default function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const preset = PRESET_SLUG_MAP[params.slug];

  if (!preset) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title={preset.title} description={preset.description} kicker="Template" />
      <div className="mt-8 space-y-4">
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
          <CardContent>
            <pre className="rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">{preset.exampleInputs.rawPrompt}</pre>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/workspace">
            <Button className="w-full">Use this template in workspace</Button>
          </Link>
          <Link href="/saved">
            <Button variant="outline" className="w-full">Browse saved prompts</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
