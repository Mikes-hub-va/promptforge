import Link from "next/link";
import { Home, Search, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const suggestions = [
  { href: "/workspace", label: "Open Workspace" },
  { href: "/templates", label: "Browse Templates" },
  { href: "/pricing", label: "View Pricing" },
  { href: "/faq", label: "Read FAQ" },
];

export default function NotFoundPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-14 md:px-8">
      <SectionHeading
        title="404: This Forge Route Was Not Found"
        description="That page doesn’t exist yet, but your next prompt can still be forged."
      />

      <Card className="border-slate-200/80 bg-white/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-500" />
            Helpful next steps
          </CardTitle>
          <CardDescription>Use these quick links to get back on-track.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {suggestions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-gradient-to-r from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Why not forge it now?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>
            If you landed here from an old bookmark, you may be hitting a route that was renamed. Open the workspace,
            paste your rough idea, and you’ll be back in the prompt refinement flow in under 30 seconds.
          </p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm text-slate-900 underline">
            <Home className="h-4 w-4" />
            Return to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
