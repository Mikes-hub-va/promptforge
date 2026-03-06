import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_HIGHLIGHTS } from "@/data/constants";

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {FEATURE_HIGHLIGHTS.map((feature) => (
        <Card key={feature.title} className="h-full">
          <CardHeader>
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Built into the forge pipeline by default.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
