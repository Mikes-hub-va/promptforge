import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Terms",
  description: "Usage expectations and product limits for Promptify.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Terms of Use"
        description="Use Promptify responsibly and align with platform policy."
      />
      <div className="prose mt-8 max-w-none">
        <p>
          Promptify is offered for lawful use. You are responsible for validating prompts before deploying outputs
          in production, legal, medical, or safety-critical environments.
        </p>
        <p>
          The service is provided as-is with no guarantees of prompt quality or correctness. Promptify includes guest-mode local storage,
          account-backed sync, and optional managed or BYOK provider routing depending on the plan and environment configuration.
        </p>
      </div>
    </div>
  );
}
