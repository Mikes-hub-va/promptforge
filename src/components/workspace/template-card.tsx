import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatePreset } from "@/types";

export function TemplateCard({ preset, onUse }: { preset: TemplatePreset; onUse?: () => void }) {
  return (
    <Card className="h-full border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{preset.title}</span>
          <span className="text-base" aria-hidden>
            {preset.icon}
          </span>
        </CardTitle>
        <CardDescription>{preset.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-slate-700">{preset.exampleInputs.goal}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{preset.outputStyle}</span>
          {onUse ? (
            <Button size="sm" onClick={onUse} variant="outline">
              Use now
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/templates/${preset.slug}`}>Open preset</Link>
            </Button>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <span>{preset.category}</span>
          <span>Model: {preset.recommendedFields.targetModel ?? "balanced defaults"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
