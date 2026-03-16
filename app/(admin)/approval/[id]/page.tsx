import { notFound } from "next/navigation";
import { DraftDetailClient } from "@/components/approval/draft-detail-client";
import { getDraft } from "@/lib/api";

export const revalidate = 0;

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await getDraft(id).catch(() => null);

  if (!draft) notFound();

  return <DraftDetailClient draft={draft} />;
}
