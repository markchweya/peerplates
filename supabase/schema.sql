-- supabase/schema.sql
-- PeerPlates Waitlist schema (idempotent)

-- 1) Extensions
create extension if not exists pgcrypto;

-- 2) Core table
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),

  -- Identity / contact
  role text not null check (role in ('consumer','vendor')),
  full_name text not null,
  email text not null,
  phone text,

  -- Student fields (derived from answers)
  is_student boolean,
  university text,

  -- Raw form answers JSON (keep this forever)
  answers jsonb not null default '{}'::jsonb,

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

  -- Consent
  accepted_privacy boolean not null default false,
  consented_at timestamptz,

  -- IMPORTANT: support both names (you insert into both in code)
  accepted_marketing boolean not null default false,
  marketing_consent boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) “No more CSV cleaning” columns (extract key review fields from answers)
--    Add whichever questions you care about showing/filtering in the Admin UI.
alter table public.waitlist_entries
  add column if not exists compliance_readiness text[] default '{}'::text[],
  add column if not exists instagram_handle text,
  add column if not exists bus_minutes integer,

  -- optional consumer convenience columns (safe to have even if unused)
  add column if not exists top_cuisines text[] default '{}'::text[],
  add column if not exists delivery_area text,
  add column if not exists dietary_preferences text[] default '{}'::text[];

-- 4) Indexes for speed
create index if not exists waitlist_entries_role_created_at_idx
  on public.waitlist_entries (role, created_at);

create index if not exists waitlist_entries_review_status_idx
  on public.waitlist_entries (review_status);

create index if not exists waitlist_entries_referral_code_idx
  on public.waitlist_entries (referral_code);

-- Optional: faster vendor ordering
create index if not exists waitlist_entries_vendor_order_idx
  on public.waitlist_entries (vendor_queue_override, vendor_priority_score desc, created_at asc)
  where role = 'vendor';

-- Optional: faster consumer ordering
create index if not exists waitlist_entries_consumer_order_idx
  on public.waitlist_entries (referral_points desc, created_at asc)
  where role = 'consumer';

-- Optional: case-insensitive “unique email” (prevents duplicates regardless of case)
-- If you already have duplicates in production, DON'T add this until you clean them.
create unique index if not exists waitlist_entries_email_lower_uniq
  on public.waitlist_entries (lower(email));

-- 5) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_waitlist_updated_at on public.waitlist_entries;
create trigger set_waitlist_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

-- 6) Sync extracted columns from answers JSON -> real columns
--    This is what stops you needing to export/clean repeatedly.
create or replace function public.sync_waitlist_extracted_columns()
returns trigger
language plpgsql
as $$
declare
  v jsonb;
begin
  v := coalesce(new.answers, '{}'::jsonb);

  -- Vendor fields
  -- compliance_readiness: expects an array in answers.compliance_readiness
  if jsonb_typeof(v->'compliance_readiness') = 'array' then
    new.compliance_readiness :=
      array(
        select jsonb_array_elements_text(v->'compliance_readiness')
      );
  else
    new.compliance_readiness := '{}'::text[];
  end if;

  -- instagram_handle: string
  new.instagram_handle := nullif(trim(coalesce(v->>'instagram_handle','')), '');

  -- bus_minutes: int (safe cast)
  begin
    new.bus_minutes := nullif(trim(coalesce(v->>'bus_minutes','')), '')::int;
  exception when others then
    new.bus_minutes := null;
  end;

  -- Consumer convenience (optional)
  if jsonb_typeof(v->'top_cuisines') = 'array' then
    new.top_cuisines := array(select jsonb_array_elements_text(v->'top_cuisines'));
  elsif jsonb_typeof(v->'cuisines') = 'array' then
    new.top_cuisines := array(select jsonb_array_elements_text(v->'cuisines'));
  else
    new.top_cuisines := '{}'::text[];
  end if;

  new.delivery_area := nullif(trim(coalesce(v->>'delivery_area','')), '');

  if jsonb_typeof(v->'dietary_preferences') = 'array' then
    new.dietary_preferences := array(select jsonb_array_elements_text(v->'dietary_preferences'));
  else
    new.dietary_preferences := '{}'::text[];
  end if;

  return new;
end;
$$;

drop trigger if exists sync_waitlist_extracted_columns on public.waitlist_entries;
create trigger sync_waitlist_extracted_columns
before insert or update of answers on public.waitlist_entries
for each row execute function public.sync_waitlist_extracted_columns();

-- 7) Referral RPC used by your API: increment_referral_stats(referrer_id, points)
create or replace function public.increment_referral_stats(
  p_referrer_id uuid,
  p_points integer
)
returns void
language plpgsql
security definer
as $$
begin
  update public.waitlist_entries
  set
    referrals_count = coalesce(referrals_count, 0) + 1,
    referral_points = coalesce(referral_points, 0) + greatest(coalesce(p_points,0), 0)
  where id = p_referrer_id
    and role = 'consumer';
end;
$$;

-- 8) (Optional but recommended) RLS
-- If you turn on RLS, you MUST create policies for your public reads/writes.
-- Since you're using SERVICE_ROLE in API routes, it's okay either way.
-- Uncomment if you want it locked down:
-- alter table public.waitlist_entries enable row level security;
