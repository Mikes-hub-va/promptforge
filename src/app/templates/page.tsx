import Link from "next/link";
import { PRESET_LIBRARY } from "@/data/presets";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Templates | PromptForge",
  description: "Starter prompt presets for coding, writing, marketing, and AI models.",
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Prompt Templates"
        kicker="PromptForge"
        description="Pick a preset and start from a proven structure rather than a blank canvas."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PRESET_LIBRARY.map((preset) => (
          <Card key={preset.id} className="h-full">
            <CardHeader>
              <CardTitle>{preset.title}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">{preset.icon} • {preset.category}</p>
              <p className="text-xs text-slate-700">Example: {preset.exampleInputs.rawPrompt}</p>
              <p className="text-xs text-slate-700">Style: {preset.outputStyle}</p>
              <Link
                href={`/templates/${preset.slug}`}
                className="inline-flex rounded-lg border border-slate-900 px-3 py-2 text-sm font-medium"
              >
                Open preset
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
