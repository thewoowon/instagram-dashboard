"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type PostDraft } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { approveDraft } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Hash,
  AlertTriangle,
  Sparkles,
  Images,
  ImageIcon,
  Film,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/date";

const FORMAT_LABEL: Record<string, { label: string; icon: React.ElementType }> = {
  carousel: { label: "캐러셀", icon: Images },
  single: { label: "단일 이미지", icon: ImageIcon },
  reels_script: { label: "릴스", icon: Film },
};

const ACCOUNT_COLOR: Record<string, string> = {
  mistakr: "bg-blue-500",
  "100:0lab": "bg-orange-500",
};

const ACCOUNT_BADGE: Record<string, string> = {
  mistakr: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "100:0lab": "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

function RiskBadge({ score }: { score: number }) {
  if (score <= 20) return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border">위험 낮음 {score}</Badge>;
  if (score <= 50) return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 border">위험 중간 {score}</Badge>;
  return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 border flex items-center gap-1"><AlertTriangle className="w-3 h-3" />위험 높음 {score}</Badge>;
}

function QualityBadge({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Sparkles className="w-3 h-3 text-yellow-500" />
      품질 {score}
    </span>
  );
}

export function DraftCard({ draft }: { draft: PostDraft }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const account = draft.account;
  const brandName = account?.brand_name ?? "unknown";
  const { label: formatLabel, icon: FormatIcon } = FORMAT_LABEL[draft.format_type] ?? FORMAT_LABEL.single;

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      await approveDraft(draft.id, action);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="p-4 hover:border-border/80 transition-colors">
      <div className="flex gap-4">
        <div className={cn("w-1 rounded-full shrink-0", ACCOUNT_COLOR[brandName] ?? "bg-muted")} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs font-medium border", ACCOUNT_BADGE[brandName])}>
              {brandName === "mistakr" ? "Mistakr" : "100:0LAB"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FormatIcon className="w-3 h-3" />
              {formatLabel}
            </span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(draft.created_at)}
            </span>
          </div>

          <p className="font-medium text-sm leading-snug mb-1.5 line-clamp-1">{draft.hook}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{draft.caption}</p>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
            {draft.hashtags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">{tag}</span>
            ))}
            {draft.hashtags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{draft.hashtags.length - 4}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge score={draft.risk_score} />
            <QualityBadge score={draft.quality_score} />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => handleAction("reject")}
                disabled={loading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                반려
              </button>
              <button
                onClick={() => handleAction("approve")}
                disabled={loading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {loading === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                승인
              </button>
              <Link
                href={`/approval/${draft.id}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                상세
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
