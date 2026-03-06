"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportMenu({ onExportTxt, onExportMd }: { onExportTxt: () => void; onExportMd: () => void }) {
  return (
    <div className="inline-flex gap-2">
      <Button size="sm" variant="outline" onClick={onExportTxt}>
        <Download className="h-4 w-4" /> Download txt
      </Button>
      <Button size="sm" variant="outline" onClick={onExportMd}>
        <Download className="h-4 w-4" /> Download md
      </Button>
    </div>
  );
}
