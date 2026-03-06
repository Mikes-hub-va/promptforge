import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { PLANS } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`border ${plan.highlight ? "ring-2 ring-slate-900/80" : ""}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plan.name}
              {plan.comingSoon ? <span className="text-xs text-slate-500">Soon</span> : null}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {plan.price}
              <span className="ml-1 text-sm font-medium text-slate-500">{plan.frequency}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={plan.id === "team" ? "/contact" : "/workspace"}>{plan.cta}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
