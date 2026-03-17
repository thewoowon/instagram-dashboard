import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getOverview(accountId?: string) {
  const qs = accountId ? `?account_id=${accountId}` : "";
  const res = await fetch(`${BASE_URL}/api/v1/analytics/overview${qs}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getDraftAnalytics(accountId?: string) {
  const qs = accountId ? `?account_id=${accountId}` : "";
  const res = await fetch(`${BASE_URL}/api/v1/analytics/drafts${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getAccounts() {
  const res = await fetch(`${BASE_URL}/api/v1/accounts`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ account_id?: string }>;
}) {
  const params = await searchParams;
  const [overview, drafts, accounts] = await Promise.all([
    getOverview(params.account_id),
    getDraftAnalytics(params.account_id),
    getAccounts(),
  ]);

  return (
    <AnalyticsDashboard
      overview={overview}
      drafts={drafts}
      accounts={accounts}
      selectedAccountId={params.account_id}
    />
  );
}
