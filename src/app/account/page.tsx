import { Metadata } from "next";
import { AccountPageClient } from "@/components/account/account-page-client";
import { APP_DOMAIN } from "@/data/constants";
import { getPlatformStatus } from "@/lib/platform/status";

export const metadata: Metadata = {
  title: "Account",
  description: "Create an account, manage billing, and sync prompt work across sessions.",
};

export default function AccountPage() {
  const platform = getPlatformStatus();

  return (
    <AccountPageClient
      billingReady={platform.billingReady}
      domain={APP_DOMAIN}
      managedProviders={platform.managedProviders}
    />
  );
}
