"use client";

import { PromptOutput } from "@/types";

export function CompareView({ original, output }: { original: string; output: PromptOutput }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Original</h3>
        <pre className="max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-700">{original || "(empty)"}</pre>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Structured Output</h3>
        <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-100">{output.basePrompt}</pre>
      </section>
    </div>
  );
}

