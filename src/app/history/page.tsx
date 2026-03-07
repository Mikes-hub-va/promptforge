import type { Metadata } from "next";
import { HistoryPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Prompt History",
  description: "Restore previous Promptify runs and pick back up from saved local history.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
