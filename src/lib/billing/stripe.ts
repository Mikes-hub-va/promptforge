import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export type StripeConfigStatus = {
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  hasPriceId: boolean;
  hasWebhookSecret: boolean;
  checkoutReady: boolean;
  billingReady: boolean;
};

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeProPriceId() {
  return process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() ?? "";
}

export function getStripeConfigStatus(): StripeConfigStatus {
  const hasPublishableKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const hasPriceId = Boolean(process.env.STRIPE_PRICE_PRO_MONTHLY?.trim());
  const hasWebhookSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
  const checkoutReady = hasSecretKey && hasPriceId;

  return {
    hasPublishableKey,
    hasSecretKey,
    hasPriceId,
    hasWebhookSecret,
    checkoutReady,
    billingReady: checkoutReady && hasWebhookSecret,
  };
}

export function isStripeConfigured() {
  return getStripeConfigStatus().billingReady;
}

export function normalizeBillingStatus(status?: string | null) {
  if (status === "trialing") {
    return "trialing" as const;
  }

  if (status === "active") {
    return "active" as const;
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due" as const;
  }

  if (status === "canceled") {
    return "canceled" as const;
  }

  return "inactive" as const;
}
