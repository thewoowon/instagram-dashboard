-- ============================================================
-- Instagram Dashboard — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- accounts
-- ============================================================
create table accounts (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null check (brand_name in ('mistakr', '100:0lab')),
  instagram_account_id text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive')),
  posting_limit_policy integer not null default 25,
  brand_rules_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- content_ideas
-- ============================================================
create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  source_type text not null check (source_type in ('trend', 'backlog', 'manual', 'repurpose')),
  topic text not null,
  angle text not null default '',
  priority_score numeric(4,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

create index on content_ideas(account_id);
create index on content_ideas(status);

-- ============================================================
-- post_drafts
-- ============================================================
create table post_drafts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  idea_id uuid references content_ideas(id) on delete set null,
  format_type text not null check (format_type in ('carousel', 'single', 'reels_script')),
  hook text not null default '',
  caption text not null default '',
  hashtags text[] not null default '{}',
  cta text not null default '',
  risk_score numeric(4,2) not null default 0,
  quality_score numeric(4,2) not null default 0,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected', 'scheduled', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on post_drafts(account_id);
create index on post_drafts(approval_status);
create index on post_drafts(created_at desc);

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger post_drafts_updated_at
  before update on post_drafts
  for each row execute function set_updated_at();

-- ============================================================
-- creative_assets
-- ============================================================
create table creative_assets (
  id uuid primary key default gen_random_uuid(),
  post_draft_id uuid not null references post_drafts(id) on delete cascade,
  asset_type text not null check (asset_type in ('image', 'video', 'thumbnail')),
  storage_url text not null,
  prompt text not null default '',
  preview_url text not null default '',
  created_at timestamptz not null default now()
);

create index on creative_assets(post_draft_id);

-- ============================================================
-- publish_jobs
-- ============================================================
create table publish_jobs (
  id uuid primary key default gen_random_uuid(),
  post_draft_id uuid not null references post_drafts(id) on delete cascade,
  scheduled_at timestamptz not null,
  publish_status text not null default 'queued'
    check (publish_status in ('queued', 'processing', 'success', 'failed', 'retrying')),
  retry_count integer not null default 0,
  meta_publish_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index on publish_jobs(post_draft_id);
create index on publish_jobs(scheduled_at);
create index on publish_jobs(publish_status);

-- ============================================================
-- post_metrics
-- ============================================================
create table post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_draft_id uuid not null references post_drafts(id) on delete cascade,
  impressions integer not null default 0,
  reach integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  saves integer not null default 0,
  shares integer not null default 0,
  profile_visits integer not null default 0,
  collected_at timestamptz not null default now()
);

create index on post_metrics(post_draft_id);
create index on post_metrics(collected_at desc);

-- ============================================================
-- Row Level Security (기본 활성화만, 정책은 서비스 역할로)
-- ============================================================
alter table accounts enable row level security;
alter table content_ideas enable row level security;
alter table post_drafts enable row level security;
alter table creative_assets enable row level security;
alter table publish_jobs enable row level security;
alter table post_metrics enable row level security;

-- service_role bypasses RLS — 서버사이드 FastAPI가 service_role key 사용
-- 어드민 대시보드에서 직접 조회 시 아래 정책으로 anon 접근 허용 (개발용)
-- 프로덕션에서는 auth.uid() 기반으로 교체할 것

create policy "allow all for now" on accounts for all using (true);
create policy "allow all for now" on content_ideas for all using (true);
create policy "allow all for now" on post_drafts for all using (true);
create policy "allow all for now" on creative_assets for all using (true);
create policy "allow all for now" on publish_jobs for all using (true);
create policy "allow all for now" on post_metrics for all using (true);

-- ============================================================
-- Seed: 계정 2개
-- ============================================================
insert into accounts (brand_name, instagram_account_id, brand_rules_json) values
(
  'mistakr',
  'mistakr_ig_placeholder',
  '{
    "tone": "insightful",
    "forbidden_words": ["무조건", "반드시", "확실히"],
    "cta_style": "learn",
    "max_hashtags": 10
  }'
),
(
  '100:0lab',
  '100to0lab_ig_placeholder',
  '{
    "tone": "provocative",
    "forbidden_words": ["법적으로 확정", "100% 과실"],
    "cta_style": "engage",
    "max_hashtags": 15
  }'
);
