import type { Metadata } from "next";
import { PromptEditor } from "@/components/workspace/prompt-editor";

export const metadata: Metadata = {
  title: "Workspace | PromptForge",
  description: "Refine prompts through structured inputs and get deterministic variants instantly.",
};

export const dynamic = "force-dynamic";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">PromptForge Workspace</h1>
        <p className="mt-2 text-sm text-slate-600">Paste rough ideas, choose a target model, and forge higher quality prompts.</p>
      </div>
      <PromptEditor />
    </div>
  );
}
