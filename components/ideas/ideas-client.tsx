"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ContentIdea, type Account } from "@/types";
import { generateIdeas, generateDraft } from "@/lib/api";

const ACCOUNT_COLORS: Record<string, string> = {
  mistakr: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "100:0lab": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "대기",
  in_progress: "진행중",
  done: "완료",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-muted-foreground",
  in_progress: "text-yellow-400",
  done: "text-green-400",
};

interface Props {
  ideas: ContentIdea[];
  accounts: Account[];
}

export function IdeasClient({ ideas: initialIdeas, accounts }: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [generating, setGenerating] = useState<string | null>(null); // account_id
  const [draftGenerating, setDraftGenerating] = useState<string | null>(null); // idea_id

  async function handleGenerateIdeas(accountId: string) {
    setGenerating(accountId);
    try {
      const newIdeas = await generateIdeas({ account_id: accountId, count: 5 });
      setIdeas((prev) => [...newIdeas, ...prev]);
    } catch (e) {
      alert("아이디어 생성 실패: " + (e as Error).message);
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerateDraft(idea: ContentIdea) {
    setDraftGenerating(idea.id);
    try {
      await generateDraft({
        account_id: idea.account_id,
        topic: idea.topic,
        angle: idea.angle,
        format_type: "carousel",
        idea_id: idea.id,
      });
      router.push("/approval");
    } catch (e) {
      alert("드래프트 생성 실패: " + (e as Error).message);
      setDraftGenerating(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">콘텐츠 아이디어</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{ideas.length}개 아이디어</p>
        </div>
        <div className="flex gap-2">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => handleGenerateIdeas(acc.id)}
              disabled={generating === acc.id}
              className={`px-3 py-1.5 text-sm rounded-md border font-medium transition-opacity disabled:opacity-50 ${ACCOUNT_COLORS[acc.brand_name] ?? "bg-muted text-foreground border-border"}`}
            >
              {generating === acc.id ? "생성중..." : `${acc.brand_name} 아이디어 생성`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ideas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            아이디어가 없습니다. 위 버튼으로 AI 생성을 시작하세요.
          </div>
        ) : (
          ideas.map((idea) => {
            const account = accounts.find((a) => a.id === idea.account_id);
            return (
              <div
                key={idea.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {account && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ACCOUNT_COLORS[account.brand_name] ?? ""}`}
                      >
                        {account.brand_name}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${STATUS_COLORS[idea.status]}`}>
                      {STATUS_LABELS[idea.status]}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      우선순위 {idea.priority_score}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{idea.topic}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{idea.angle}</p>
                </div>
                {idea.status === "draft" && (
                  <button
                    onClick={() => handleGenerateDraft(idea)}
                    disabled={draftGenerating === idea.id}
                    className="shrink-0 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-opacity"
                  >
                    {draftGenerating === idea.id ? "생성중..." : "드래프트 생성"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
