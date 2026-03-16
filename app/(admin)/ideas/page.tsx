import { getIdeas, getAccounts } from "@/lib/api";
import { IdeasClient } from "@/components/ideas/ideas-client";

export const revalidate = 0;

export default async function IdeasPage() {
  const [ideas, accounts] = await Promise.all([
    getIdeas().catch(() => []),
    getAccounts().catch(() => []),
  ]);

  // priority_score 내림차순 정렬
  const sorted = [...ideas].sort((a, b) => b.priority_score - a.priority_score);

  return <IdeasClient ideas={sorted} accounts={accounts} />;
}
