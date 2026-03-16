import { DraftCard } from "@/components/approval/draft-card";
import { ApprovalFilters } from "@/components/approval/approval-filters";
import { getDrafts } from "@/lib/api";

export const revalidate = 0; // 항상 최신 데이터

export default async function ApprovalPage() {
  const drafts = await getDrafts({ approval_status: "pending" }).catch(() => []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">승인 대기</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {drafts.length}개 드래프트가 검토를 기다리고 있습니다
          </p>
        </div>
      </div>

      <ApprovalFilters />

      <div className="flex flex-col gap-4 mt-4">
        {drafts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            승인 대기 중인 드래프트가 없습니다
          </div>
        ) : (
          drafts.map((draft) => <DraftCard key={draft.id} draft={draft} />)
        )}
      </div>
    </div>
  );
}
