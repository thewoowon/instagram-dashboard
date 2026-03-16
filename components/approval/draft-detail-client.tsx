"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type PostDraft } from "@/types";
import { approveDraft, updateDraft } from "@/lib/api";
import { AssetUploader } from "@/components/approval/asset-uploader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Hash,
  Megaphone,
  Zap,
  ShieldAlert,
  Info,
} from "lucide-react";

const ACCOUNT_COLOR: Record<string, string> = {
  mistakr: "text-blue-400",
  "100:0lab": "text-orange-400",
};

function ScoreBar({ label, score, max = 100, icon: Icon, color }: {
  label: string;
  score: number;
  max?: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <Icon className={cn("w-4 h-4 shrink-0", color)} />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{score}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", color.replace("text-", "bg-"))}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface DraftDetailClientProps {
  draft: PostDraft;
}

export function DraftDetailClient({ draft }: DraftDetailClientProps) {
  const router = useRouter();
  const [caption, setCaption] = useState(draft.caption);
  const [hook, setHook] = useState(draft.hook);
  const [cta, setCta] = useState(draft.cta);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brandName = draft.account?.brand_name ?? "unknown";
  const accountLabel = brandName === "mistakr" ? "Mistakr" : "100:0LAB";

  const handleSave = async () => {
    await updateDraft(draft.id, { hook, caption, cta });
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateDraft(draft.id, { hook, caption, cta });
      await approveDraft(draft.id, "approve");
      router.push("/approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await approveDraft(draft.id, "reject");
      router.push("/approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskColor =
    draft.risk_score <= 20
      ? "text-green-400"
      : draft.risk_score <= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", ACCOUNT_COLOR[brandName])}>
              {accountLabel}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">
              {draft.format_type === "carousel"
                ? "캐러셀"
                : draft.format_type === "single"
                ? "단일 이미지"
                : "릴스"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            반려
          </button>
          <button
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            예약
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            승인
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Content editor */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Hook */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">훅 (첫 줄)</span>
            </div>
            <Textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="resize-none text-sm min-h-[60px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="훅을 입력하세요"
            />
          </Card>

          {/* Caption */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">캡션</span>
              <span className="text-xs text-muted-foreground">{caption.length}자</span>
            </div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none text-sm min-h-[180px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
              placeholder="캡션을 입력하세요"
            />
          </Card>

          {/* CTA */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">CTA</span>
            </div>
            <Textarea
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="resize-none text-sm min-h-[50px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="CTA를 입력하세요"
            />
          </Card>

          {/* Hashtags */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">해시태그</span>
              <span className="text-xs text-muted-foreground ml-auto">{draft.hashtags.length}개</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {draft.hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="text-xs font-normal cursor-pointer hover:bg-muted text-muted-foreground"
              >
                + 추가
              </Badge>
            </div>
          </Card>

          {/* Image upload */}
          <AssetUploader draftId={draft.id} initialAssets={draft.creative_assets} />

          {/* Quick regen prompts */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">빠른 재생성</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "훅 더 자극적으로",
                "길이 20% 줄여서",
                "톤 더 부드럽게",
                "슬라이드 1장 더",
                "근거성 표현으로",
                "CTA 강화",
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="px-3 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Scores & Info */}
        <div className="flex flex-col gap-4">
          {/* Scores */}
          <Card className="p-4">
            <p className="text-sm font-medium mb-4">점수</p>
            <div className="flex flex-col gap-3.5">
              <ScoreBar
                label="품질"
                score={draft.quality_score}
                icon={Sparkles}
                color="text-yellow-400"
              />
              <ScoreBar
                label="위험도"
                score={draft.risk_score}
                icon={ShieldAlert}
                color={riskColor}
              />
            </div>

            {draft.risk_score > 50 && (
              <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 leading-relaxed">
                  위험 점수가 높습니다. 법적 단정 표현이나 허위 사실이 없는지 확인하세요.
                </p>
              </div>
            )}
          </Card>

          {/* Brand rules */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">브랜드 룰</p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {draft.account?.brand_rules_json &&
                Object.entries(draft.account.brand_rules_json).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-foreground/50 shrink-0 w-24">{k}</span>
                    <span className="break-all">
                      {Array.isArray(v) ? v.join(", ") : String(v)}
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Publish time */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">게시 예약</p>
            </div>
            <input
              type="datetime-local"
              className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              defaultValue={new Date(Date.now() + 1000 * 60 * 60 * 24)
                .toISOString()
                .slice(0, 16)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
