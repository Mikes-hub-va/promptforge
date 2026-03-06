"use client";

import { useState } from "react";
import { ClipboardCopy, WandSparkles, TextSearch } from "lucide-react";
import { PromptOutput } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

export function OutputTabs({
  output,
  onCopy,
  onExport,
  onCompare,
}: {
  output: PromptOutput;
  onCopy: (content: string) => void;
  onExport: (content: string, format: "txt" | "md") => void;
  onCompare: () => void;
}) {
  const [active, setActive] = useState("balanced");
  const activePrompt =
    output.variants.find((variant) => variant.label.toLowerCase().includes(active)) || output.variants[0];
  const currentText = activePrompt?.prompt ?? output.basePrompt;

  const items = output.variants.map((variant) => ({ id: variant.label.toLowerCase(), label: variant.label }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Forged Prompt</CardTitle>
            <p className="mt-1 text-sm text-slate-600">Pick a variant and copy/export in one click.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onCopy(currentText)}>
              <ClipboardCopy className="h-4 w-4" /> Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => onExport(currentText, "md")}>
              <WandSparkles className="h-4 w-4" /> Export .md
            </Button>
            <Button size="sm" variant="outline" onClick={() => onExport(currentText, "txt")}>
              <WandSparkles className="h-4 w-4" /> Export .txt
            </Button>
            <Button size="sm" onClick={onCompare}>
              <TextSearch className="h-4 w-4" /> Compare
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs items={items} activeId={active} onSelect={setActive} />
        <pre className="mt-4 max-h-[26rem] overflow-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          {currentText}
        </pre>
      </CardContent>
    </Card>
  );
}
