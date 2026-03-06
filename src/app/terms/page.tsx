import { SectionHeading } from "@/components/marketing/section-heading";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Terms of Use"
        description="Use PromptForge responsibly and align with platform policy."
      />
      <div className="prose mt-8 max-w-none">
        <p>
          PromptForge is offered for lawful use. You are responsible for validating prompts before deploying outputs
          in production, legal, medical, or safety-critical environments.
        </p>
        <p>
          The service is provided as-is with no guarantees of prompt quality or correctness. The MVP provides
          deterministic prompt transformation and local storage features.
        </p>
      </div>
    </div>
  );
}
