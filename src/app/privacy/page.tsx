import { SectionHeading } from "@/components/marketing/section-heading";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title="Privacy Policy" description="Your data, your control." />
      <div className="prose mt-8 max-w-none space-y-4">
        <p>PromptForge stores saved prompts and generation history in your browser localStorage by default.</p>
        <p>No server-side prompt text is collected in the free MVP flow. If you add provider API keys in your environment,
        requests may be sent directly to that provider using your own account settings.</p>
        <p>We may collect anonymous usage metrics to improve performance and reliability.</p>
      </div>
    </div>
  );
}
