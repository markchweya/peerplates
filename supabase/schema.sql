-- supabase/schema.sql
-- PeerPlates Waitlist (consumer/vendor) + referrals + admin review + consent + anti-dup email-per-role
-- Safe + idempotent where possible.

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Main table (created only if missing)
-- NOTE: If your table already exists, this won't overwrite anything.
-- ------------------------------------------------------------
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),

  -- core
  role text not null check (role in ('consumer','vendor')),
  full_name text not null,
  email text not null,
  phone text,
  is_student boolean,
  university text,
  answers jsonb not null default '{}'::jsonb,

  -- referral identity
  referral_code text unique,
  referred_by text,

  -- vendor scoring
  vendor_priority_score int not null default 0,
  certificate_url text,

  -- referral stats
  referral_points int not null default 0,
  referrals_count int not null default 0,

  -- admin review
  review_status text not null default 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  vendor_queue_override integer,

  -- consent / privacy
  accepted_privacy boolean not null default false,

  -- IMPORTANT: keep BOTH names to avoid mismatches
  marketing_consent boolean not null default false,
  accepted_marketing boolean not null default false,

  privacy_version text,
  consented_at timestamptz,

  -- misc tracking (optional)
  signup_source text,
  captcha_verified boolean,
  request_ip text,
  user_agent text,
  flagged boolean not null default false,
  flagged_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) Add missing columns (if table existed already)
-- ------------------------------------------------------------
alter table public.waitlist_entries add column if not exists referral_code text;
alter table public.waitlist_entries add column if not exists referred_by text;

alter table public.waitlist_entries add column if not exists vendor_priority_score int not null default 0;
alter table public.waitlist_entries add column if not exists certificate_url text;

alter table public.waitlist_entries add column if not exists referral_points int not null default 0;
alter table public.waitlist_entries add column if not exists referrals_count int not null default 0;

alter table public.waitlist_entries add column if not exists review_status text not null default 'pending';
alter table public.waitlist_entries add column if not exists admin_notes text;
alter table public.waitlist_entries add column if not exists reviewed_at timestamptz;
alter table public.waitlist_entries add column if not exists reviewed_by text;
alter table public.waitlist_entries add column if not exists vendor_queue_override integer;

alter table public.waitlist_entries add column if not exists accepted_privacy boolean not null default false;

-- ✅ Fix for your error: ensure marketing_consent exists (you confirmed it does now, but this keeps it safe)
alter table public.waitlist_entries add column if not exists marketing_consent boolean not null default false;
alter table public.waitlist_entries add column if not exists accepted_marketing boolean not null default false;

alter table public.waitlist_entries add column if not exists privacy_version text;
alter table public.waitlist_entries add column if not exists consented_at timestamptz;

alter table public.waitlist_entries add column if not exists signup_source text;
alter table public.waitlist_entries add column if not exists captcha_verified boolean;
alter table public.waitlist_entries add column if not exists request_ip text;
alter table public.waitlist_entries add column if not exists user_agent text;
alter table public.waitlist_entries add column if not exists flagged boolean not null default false;
alter table public.waitlist_entries add column if not exists flagged_reason text;

alter table public.waitlist_entries add column if not exists created_at timestamptz not null default now();
alter table public.waitlist_entries add column if not exists updated_at timestamptz not null default now();

-- ------------------------------------------------------------
-- 3) Keep consent columns consistent (because your DB has accepted_marketing)
-- ------------------------------------------------------------
update public.waitlist_entries
set marketing_consent = accepted_marketing
where marketing_consent = false and accepted_marketing = true;

update public.waitlist_entries
set accepted_marketing = marketing_consent
where accepted_marketing = false and marketing_consent = true;

-- ------------------------------------------------------------
-- 4) Ensure review_status check constraint exists
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'waitlist_entries'
      and c.conname = 'waitlist_entries_review_status_chk'
  ) then
    alter table public.waitlist_entries
      add constraint waitlist_entries_review_status_chk
      check (review_status in ('pending','reviewed','approved','rejected'));
  end if;
end $$;

-- ------------------------------------------------------------
-- 5) updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_waitlist_set_updated_at on public.waitlist_entries;
create trigger trg_waitlist_set_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 6) Helpful indexes
-- ------------------------------------------------------------
create index if not exists waitlist_entries_role_idx
  on public.waitlist_entries(role);

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries(created_at);

create index if not exists waitlist_entries_review_status_idx
  on public.waitlist_entries(review_status);

create index if not exists waitlist_entries_vendor_score_idx
  on public.waitlist_entries(vendor_priority_score);

create index if not exists waitlist_entries_vendor_queue_override_idx
  on public.waitlist_entries(vendor_queue_override);

create index if not exists waitlist_entries_referral_code_idx
  on public.waitlist_entries(referral_code);

create index if not exists waitlist_entries_consumer_sort_idx
  on public.waitlist_entries(role, referral_points, created_at);

-- ------------------------------------------------------------
-- 7) BASIC SPAM PROTECTION: unique email per role (case-insensitive)
--     If duplicates exist, keep newest and delete older.
-- ------------------------------------------------------------
with ranked as (
  select
    id,
    role,
    lower(email) as email_key,
    row_number() over (
      partition by role, lower(email)
      order by created_at desc
    ) as rn
  from public.waitlist_entries
)
delete from public.waitlist_entries w
using ranked r
where w.id = r.id
  and r.rn > 1;

create unique index if not exists waitlist_entries_role_email_ux
  on public.waitlist_entries (role, lower(email));

-- ------------------------------------------------------------
-- 8) Referral RPC used by /api/signup
-- ------------------------------------------------------------
create or replace function public.increment_referral_stats(
  p_referrer_id uuid,
  p_points int
)
returns void
language plpgsql
security definer
as $$
begin
  update public.waitlist_entries
  set
    referral_points = referral_points + greatest(p_points, 0),
    referrals_count = referrals_count + 1,
    updated_at = now()
  where id = p_referrer_id;
end;
$$;

grant execute on function public.increment_referral_stats(uuid, int) to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 9) Force PostgREST to refresh schema (fixes schema cache errors)
-- ------------------------------------------------------------
notify pgrst, 'reload schema';
