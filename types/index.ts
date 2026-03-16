export type AccountBrand = "mistakr" | "100:0lab";

export type PostFormat = "carousel" | "single" | "reels_script";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "scheduled" | "published";

export type PublishStatus = "queued" | "processing" | "success" | "failed" | "retrying";

export interface Account {
  id: string;
  brand_name: AccountBrand;
  instagram_account_id: string;
  status: "active" | "inactive";
  posting_limit_policy: number;
  brand_rules_json: Record<string, unknown>;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  account_id: string;
  source_type: "trend" | "backlog" | "manual" | "repurpose";
  topic: string;
  angle: string;
  priority_score: number;
  status: "draft" | "in_progress" | "done";
  created_at: string;
  account?: Account;
}

export interface PostDraft {
  id: string;
  account_id: string;
  idea_id: string | null;
  format_type: PostFormat;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  risk_score: number;
  quality_score: number;
  approval_status: ApprovalStatus;
  created_at: string;
  updated_at: string;
  account?: Account;
  idea?: ContentIdea;
  creative_assets?: CreativeAsset[];
  publish_job?: PublishJob;
}

export interface CreativeAsset {
  id: string;
  post_draft_id: string;
  asset_type: "image" | "video" | "thumbnail";
  storage_url: string;
  prompt: string;
  preview_url: string;
  created_at: string;
}

export interface PublishJob {
  id: string;
  post_draft_id: string;
  scheduled_at: string;
  publish_status: PublishStatus;
  retry_count: number;
  meta_publish_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface PostMetrics {
  id: string;
  post_draft_id: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  profile_visits: number;
  collected_at: string;
}
