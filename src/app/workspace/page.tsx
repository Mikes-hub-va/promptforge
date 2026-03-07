import type { Metadata } from "next";
import { PromptEditor } from "@/components/workspace/prompt-editor";

export const metadata: Metadata = {
  title: "Workspace Dashboard",
  description: "Forge prompts from a live dashboard with draft intelligence, provider controls, and reusable prompt packs.",
};

export const dynamic = "force-dynamic";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <PromptEditor />
    </div>
  );
}
