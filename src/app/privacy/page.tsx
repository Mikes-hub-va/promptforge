import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Promptify stores guest data, syncs account data, and routes provider requests.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title="Privacy Policy" description="Your data, your control." />
      <div className="prose mt-8 max-w-none space-y-4">
        <p>Guest mode stores saved prompts and history in browser storage on your device.</p>
        <p>If you create an account, Promptify syncs saved prompts and history to the application database so your workspace can persist across sessions.</p>
        <p>When you trigger a managed cloud run or submit a BYOK request, prompt content is sent to the selected model provider only for that request path.</p>
        <p>We may collect minimal operational telemetry to improve reliability, billing, and abuse prevention.</p>
      </div>
    </div>
  );
}
