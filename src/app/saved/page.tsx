import type { Metadata } from "next";
import { SavedPromptsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Saved Prompts",
  description: "Search, organize, favorite, and reopen your best Promptify prompt packs.",
};

export default function SavedPromptsPage() {
  return <SavedPromptsPageClient />;
}
