import { JsonLd } from "@/components/seo/json-ld";
import { PLANS } from "@/data/constants";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "PromptForge",
  offers: PLANS.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price === "Coming Soon" ? "0" : plan.price.replace("$", ""),
    priceCurrency: "USD",
    availability: plan.comingSoon ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    description: plan.description,
  })),
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <JsonLd data={pricingSchema} />
      <SectionHeading
        title="Pricing"
        kicker="Simple and clear"
        description="Start free, iterate with confidence, and scale to pro as you publish more prompts."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.highlight ? "ring-2 ring-slate-900" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{plan.price} <span className="text-sm">{plan.frequency}</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
