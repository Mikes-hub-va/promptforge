"use client";

import { ArrowRight, FileText, WandSparkles } from "lucide-react";
import { PromptOutput } from "@/types";

export function CompareView({ original, output }: { original: string; output: PromptOutput }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/78 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Original Brief</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">The raw request before Promptify added structure and output discipline.</p>
        <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-slate-200/70 bg-white/82 p-4 text-xs leading-6 text-slate-700">
          {original || "(empty)"}
        </pre>
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white/78 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WandSparkles className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">Structured Output</h3>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
            <ArrowRight className="h-3.5 w-3.5" />
            Output contract added
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-600">The active output now carries clearer objective framing, constraints, and package-ready sections.</p>
        <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,250,0.9))] p-4 text-xs leading-6 text-slate-800">
          {output.basePrompt}
        </pre>
      </div>
    </section>
  );
}
