"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  Sparkles,
  ShieldAlert,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
} from "lucide-react";

interface Overview {
  total_drafts: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  avg_quality_score: number;
  avg_risk_score: number;
}

interface DraftSummary {
  id: string;
  hook: string;
  format_type: string;
  approval_status: string;
  quality_score: number;
  risk_score: number;
  created_at: string;
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  impressions: number;
}

interface Account {
  id: string;
  brand_name: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "검토 대기", color: "text-yellow-400", icon: Clock },
  approved:  { label: "승인됨",    color: "text-blue-400",   icon: CheckCircle2 },
  published: { label: "발행됨",    color: "text-green-400",  icon: Send },
  rejected:  { label: "반려됨",    color: "text-red-400",    icon: XCircle },
};

const ACCOUNT_COLOR: Record<string, string> = {
  mistakr:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "100:0lab": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function AnalyticsDashboard({
  overview,
  drafts,
  accounts,
  selectedAccountId,
}: {
  overview: Overview | null;
  drafts: DraftSummary[];
  accounts: Account[];
  selectedAccountId?: string;
}) {
  const router = useRouter();

  const setAccount = (id: string | undefined) => {
    const url = id ? `/analytics?account_id=${id}` : "/analytics";
    router.push(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">애널리틱스</h1>
          <p className="text-sm text-muted-foreground mt-0.5">콘텐츠 성과 현황</p>
        </div>

        {/* Account filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setAccount(undefined)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              !selectedAccountId
                ? "bg-foreground text-background border-foreground"
                : "bg-muted text-muted-foreground border-border hover:text-foreground"
            )}
          >
            전체
          </button>
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccount(acc.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                selectedAccountId === acc.id
                  ? ACCOUNT_COLOR[acc.brand_name] + " border-current"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {acc.brand_name === "mistakr" ? "Mistakr" : "100:0LAB"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "전체 드래프트", value: overview.total_drafts, icon: FileText, color: "text-foreground" },
            { label: "검토 대기",     value: overview.pending,       icon: Clock,     color: "text-yellow-400" },
            { label: "발행됨",        value: overview.published,     icon: Send,      color: "text-green-400" },
            { label: "반려됨",        value: overview.rejected,      icon: XCircle,   color: "text-red-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <p className="text-2xl font-semibold">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Score cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">평균 품질 점수</span>
            </div>
            <p className="text-2xl font-semibold">{overview.avg_quality_score}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${overview.avg_quality_score}%` }}
              />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">평균 위험 점수</span>
            </div>
            <p className="text-2xl font-semibold">{overview.avg_risk_score}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${overview.avg_risk_score}%` }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Draft list */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-1">드래프트 목록</h2>
        {drafts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">데이터 없음</Card>
        ) : (
          drafts.map((d) => {
            const status = STATUS_CONFIG[d.approval_status] ?? STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.hook || "(훅 없음)"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {d.format_type}
                      </Badge>
                      <span className={cn("flex items-center gap-1 text-xs", status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Metrics — only meaningful if published */}
                  {d.approval_status === "published" && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {d.reach.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {d.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {d.comments.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> {d.saves.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Scores */}
                  <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      {d.quality_score}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" />
                      {d.risk_score}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
