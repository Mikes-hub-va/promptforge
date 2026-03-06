"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ content, label = "Copy" }: { content: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <Copy className="h-4 w-4" />
      {copied ? "Copied" : label}
    </Button>
  );
}

