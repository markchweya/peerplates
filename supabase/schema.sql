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
  -- Partner cooks: "other / please specify" free text
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
  -- consent (safe)
  add column if not exists accepted_marketing boolean not null default false,
  add column if not exists marketing_consent boolean not null default false,

  -- extra fields (safe)
  add column if not exists captcha_verified boolean,
  add column if not exists flagged boolean,
  add column if not exists flagged_reason text,
  add column if not exists privacy_version text,
  add column if not exists request_ip text,
  add column if not exists signup_source text,
  add column if not exists user_agent text,

  -- extracted columns (safe)
  add column if not exists compliance_readiness text[] not null default '{}'::text[],
  add column if not exists has_food_ig boolean,
  add column if not exists instagram_handle text,

  -- postcode (safe)
  add column if not exists postcode_area text,

  -- optional city
  add column if not exists city text,

  add column if not exists top_cuisines text[] not null default '{}'::text[],
  add column if not exists delivery_area text,
  add column if not exists dietary_preferences text[] not null default '{}'::text[],
  add column if not exists partner_other_specify text,

  -- queue_code (safe)
  add column if not exists queue_code text;

-- 3b) Remove legacy bus/minutes stuff if present (idempotent)
alter table public.waitlist_entries
  drop column if exists bus_minutes;

drop index if exists waitlist_entries_bus_minutes_idx;

-- 3c) Enforce: if has_food_ig = true then instagram_handle must be present
-- Postgres DOES NOT support "ADD CONSTRAINT IF NOT EXISTS", so we use a DO block.
-- NOT VALID avoids breaking existing rows; you can VALIDATE later after cleanup/backfill.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'waitlist_entries_ig_handle_required'
      and c.conrelid = 'public.waitlist_entries'::regclass
  ) then
    alter table public.waitlist_entries
      add constraint waitlist_entries_ig_handle_required
      check (has_food_ig is distinct from true or instagram_handle is not null)
      not valid;
  end if;
end $$;

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

-- Optional: case-insensitive unique email
create unique index if not exists waitlist_entries_email_lower_uniq
  on public.waitlist_entries (lower(email));

-- 5) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_waitlist_set_updated_at on public.waitlist_entries;
create trigger trg_waitlist_set_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

-- 6) Sync extracted columns from answers JSON -> real columns
create or replace function public.sync_waitlist_extracted_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
  ig_yes text;
begin
  v := coalesce(new.answers, '{}'::jsonb);

  -- City (tries multiple keys) - optional
  new.city :=
    nullif(
      trim(
        coalesce(
          v->>'city',
          v->>'location_city',
          v->>'vendor_city',
          v->>'consumer_city',
          ''
        )
      ),
      ''
    );

  -- postcode_area (store first segment only, uppercase)
  new.postcode_area :=
    nullif(
      upper(split_part(trim(coalesce(v->>'postcode_area', v->>'postcode', '')), ' ', 1)),
      ''
    );

  -- compliance_readiness
  if jsonb_typeof(v->'compliance_readiness') = 'array' then
    new.compliance_readiness :=
      array(select jsonb_array_elements_text(v->'compliance_readiness'));
  else
    new.compliance_readiness := '{}'::text[];
  end if;

  -- has_food_ig (supports "Yes/No" and boolean-ish strings)
  ig_yes := lower(trim(coalesce(v->>'has_food_ig', '')));
  if ig_yes in ('yes','true','1') then
    new.has_food_ig := true;
  elsif ig_yes in ('no','false','0') then
    new.has_food_ig := false;
  else
    new.has_food_ig := null;
  end if;

  -- instagram_handle (support new key + backward compat)
  new.instagram_handle :=
    nullif(
      trim(
        coalesce(
          v->>'ig_handle',         -- your current form key
          v->>'instagram_handle',  -- backward compat
          v->>'instagram',         -- optional fallback
          ''
        )
      ),
      ''
    );

  -- top_cuisines (try two keys)
  if jsonb_typeof(v->'top_cuisines') = 'array' then
    new.top_cuisines := array(select jsonb_array_elements_text(v->'top_cuisines'));
  elsif jsonb_typeof(v->'cuisines') = 'array' then
    new.top_cuisines := array(select jsonb_array_elements_text(v->'cuisines'));
  else
    new.top_cuisines := '{}'::text[];
  end if;

  -- delivery_area
  new.delivery_area := nullif(trim(coalesce(v->>'delivery_area','')), '');

  -- dietary_preferences
  if jsonb_typeof(v->'dietary_preferences') = 'array' then
    new.dietary_preferences := array(select jsonb_array_elements_text(v->'dietary_preferences'));
  else
    new.dietary_preferences := '{}'::text[];
  end if;

  -- partner_other_specify (free text from "Other, please specify")
  new.partner_other_specify :=
    nullif(
      trim(
        coalesce(
          v->>'partner_other_specify',
          v->>'other_specify',
          v->>'other',
          ''
        )
      ),
      ''
    );

  return new;
end;
$$;

drop trigger if exists sync_waitlist_extracted_columns on public.waitlist_entries;
create trigger sync_waitlist_extracted_columns
before insert or update of answers on public.waitlist_entries
for each row execute function public.sync_waitlist_extracted_columns();

-- 7) Referral RPC used by your API
create or replace function public.increment_referral_stats(
  p_referrer_id uuid,
  p_points integer
)
returns void
language plpgsql
security definer
set search_path = public
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

-- 8) Backfill extracted columns for existing rows (forces trigger to populate)
update public.waitlist_entries
set answers = coalesce(answers, '{}'::jsonb)
where true;

-- "touch" answers to force the trigger on update-of-answers paths
update public.waitlist_entries
set answers = answers
where true;

-- 9) Optional: validate constraint later
-- alter table public.waitlist_entries validate constraint waitlist_entries_ig_handle_required;

-- 10) IMPORTANT: FIX "permission denied" (GRANTS)
-- If your Postgres privileges got tightened, inserts/selects will fail even without RLS.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
on table public.waitlist_entries
to anon, authenticated, service_role;

grant execute
on function public.increment_referral_stats(uuid, integer)
to anon, authenticated, service_role;

-- Helpful when you changed schema and PostgREST is caching
select pg_notify('pgrst', 'reload schema');


-- =====================================================
-- 11) ZERO-TRUST ROW LEVEL SECURITY (HARDENED)

-- Add ownership column (required for zero-trust model)
alter table public.waitlist_entries
  add column if not exists user_id uuid;

-- Enable RLS
alter table public.waitlist_entries enable row level security;

-- Remove any existing insert policies
drop policy if exists "Public can insert waitlist entries" on public.waitlist_entries;
drop policy if exists "Authenticated can insert waitlist entries" on public.waitlist_entries;

-- Remove broad grants
revoke insert on public.waitlist_entries from anon;

-- INSERT: Only authenticated users inserting their own row
create policy "Users can insert own waitlist row"
on public.waitlist_entries
for insert
 to authenticated
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and accepted_privacy = true
);

-- SELECT: Users can only read their own row
create policy "Users can read own waitlist row"
on public.waitlist_entries
for select
 to authenticated
using (user_id = auth.uid());

-- UPDATE: Users can update only their own row
create policy "Users can update own waitlist row"
on public.waitlist_entries
for update
 to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: Optional strict self-delete only
create policy "Users can delete own waitlist row"
on public.waitlist_entries
for delete
 to authenticated
using (user_id = auth.uid());

-- Lock referral RPC to service_role only
revoke execute on function public.increment_referral_stats(uuid, integer)
from anon, authenticated;

grant execute on function public.increment_referral_stats(uuid, integer)
to service_role;

-- Reload PostgREST schema cache
select pg_notify('pgrst', 'reload schema');
-- =====================================================

-- Enable RLS
alter table public.waitlist_entries
enable row level security;

-- -----------------------------------------------------
-- POLICY: Allow public (anon) to insert waitlist rows
-- -----------------------------------------------------
create policy "Public can insert waitlist entries"
on public.waitlist_entries
for insert
to anon, authenticated
with check (
  email is not null
  and role in ('consumer','vendor')
  and accepted_privacy = true
);

-- -----------------------------------------------------
-- POLICY: Allow authenticated users to insert
-- -----------------------------------------------------
-- Authenticated handled by shared insert policy above
-- (separate permissive policy removed for security)


-- -----------------------------------------------------
-- (OPTIONAL) If you want authenticated users to read all
-- Remove this if not needed
-- -----------------------------------------------------
-- create policy "Authenticated can read waitlist"
-- on public.waitlist_entries
-- for select
-- to authenticated
-- using (true);

-- -----------------------------------------------------
-- IMPORTANT: Do NOT allow anon select/update/delete
-- -----------------------------------------------------

-- (Optional hardening)
revoke update, delete on public.waitlist_entries from anon;
revoke update, delete on public.waitlist_entries from authenticated;

-- Reload PostgREST schema cache
n public.waitlist_entries
-- for select
-- to authenticated
-- using (true);

-- -----------------------------------------------------
-- IMPORTANT: Do NOT allow anon select/update/delete
-- -----------------------------------------------------

-- (Optional hardening)
revoke update, delete on public.waitlist_entries from anon;
revoke update, delete on public.waitlist_entries from authenticated;

-- Reload PostgREST schema cache
select pg_notify('pgrst', 'reload schema');
