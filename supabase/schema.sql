-- supabase/schema.sql
-- PeerPlates Waitlist schema (idempotent; safe to paste into Supabase SQL Editor)

-- 1) Extensions
create extension if not exists pgcrypto;

-- 2) Base table (created only if missing)
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),

  -- Identity / contact
  role text not null check (role in ('consumer','vendor')),
  full_name text not null,
  email text not null,
  phone text,

  -- Student fields (optional / derived)
  is_student boolean,
  university text,

  -- Raw form answers JSON
  answers jsonb not null default '{}'::jsonb,

  -- Extracted / denormalized columns (from answers)
  compliance_readiness text[] not null default '{}'::text[],
  has_food_ig boolean,
  instagram_handle text,
  postcode_area text,
  city text,
  top_cuisines text[] not null default '{}'::text[],
  delivery_area text,
  dietary_preferences text[] not null default '{}'::text[],
  partner_other_specify text,

  -- Referral system
  referral_code text unique,
  referred_by text,
  referrals_count integer not null default 0,
  referral_points integer not null default 0,

  -- Vendor priority / ordering
  vendor_priority_score integer not null default 0 check (vendor_priority_score between 0 and 10),
  vendor_queue_override integer,
  certificate_url text,

  -- Review workflow
  review_status text not null default 'pending' check (review_status in ('pending','reviewed','approved','rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by text,

  -- Queue lookup (public code users can paste)
  queue_code text unique,

  -- Consent
  accepted_privacy boolean not null default false,
  consented_at timestamptz,
  accepted_marketing boolean not null default false,
  marketing_consent boolean not null default false,

  -- Extra fields (optional but harmless)
  captcha_verified boolean,
  flagged boolean,
  flagged_reason text,
  privacy_version text,
  request_ip text,
  signup_source text,
  user_agent text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Ensure columns exist even if table already existed (idempotent)
alter table public.waitlist_entries
  add column if not exists accepted_marketing boolean not null default false,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists captcha_verified boolean,
  add column if not exists flagged boolean,
  add column if not exists flagged_reason text,
  add column if not exists privacy_version text,
  add column if not exists request_ip text,
  add column if not exists signup_source text,
  add column if not exists user_agent text,
  add column if not exists compliance_readiness text[] not null default '{}'::text[],
  add column if not exists has_food_ig boolean,
  add column if not exists instagram_handle text,
  add column if not exists postcode_area text,
  add column if not exists city text,
  add column if not exists top_cuisines text[] not null default '{}'::text[],
  add column if not exists delivery_area text,
  add column if not exists dietary_preferences text[] not null default '{}'::text[],
  add column if not exists partner_other_specify text,
  add column if not exists queue_code text;

alter table public.waitlist_entries
  drop column if exists bus_minutes;

drop index if exists waitlist_entries_bus_minutes_idx;

-- 4) Indexes
create index if not exists waitlist_entries_role_created_at_idx
  on public.waitlist_entries (role, created_at);

create index if not exists waitlist_entries_review_status_idx
  on public.waitlist_entries (review_status);

create index if not exists waitlist_entries_referral_code_idx
  on public.waitlist_entries (referral_code);

create index if not exists waitlist_entries_queue_code_idx
  on public.waitlist_entries (queue_code);

create index if not exists waitlist_entries_city_idx
  on public.waitlist_entries (city);

create index if not exists waitlist_entries_postcode_area_idx
  on public.waitlist_entries (postcode_area);

create index if not exists waitlist_entries_instagram_handle_idx
  on public.waitlist_entries (instagram_handle);

create index if not exists waitlist_entries_vendor_order_idx
  on public.waitlist_entries (vendor_queue_override, vendor_priority_score desc, created_at asc)
  where role = 'vendor';

create index if not exists waitlist_entries_consumer_order_idx
  on public.waitlist_entries (referral_points desc, created_at asc)
  where role = 'consumer';

create unique index if not exists waitlist_entries_email_lower_uniq
  on public.waitlist_entries (lower(email));

-- 5) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists trg_waitlist_set_updated_at on public.waitlist_entries;
create trigger trg_waitlist_set_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

-- 6) Referral RPC
create or replace function public.increment_referral_stats(
  p_referrer_id uuid,
  p_points integer
)
returns void
language plpgsql
security definer
as $function$
begin
  update public.waitlist_entries
  set
    referrals_count = coalesce(referrals_count, 0) + 1,
    referral_points = coalesce(referral_points, 0) + greatest(coalesce(p_points,0), 0)
  where id = p_referrer_id
    and role = 'consumer';
end;
$function$;

-- 7) Grants
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
on table public.waitlist_entries
to anon, authenticated, service_role;

grant execute
on function public.increment_referral_stats(uuid, integer)
to anon, authenticated, service_role;

select pg_notify('pgrst', 'reload schema');
