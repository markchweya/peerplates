-- PeerPlates Waitlist MVP (TJ-003)
-- Run once in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'waitlist_role') then
    create type waitlist_role as enum ('consumer', 'vendor');
  end if;
end$$;

-- Main table
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  role waitlist_role not null,

  full_name text not null,
  email text not null,
  phone text null,

  -- answers we explicitly care about (first-class columns)
  is_student boolean null,
  university text null,

  -- everything else (including checkboxes arrays) lives here
  answers jsonb not null default '{}'::jsonb,

  -- referrals
  referral_code text not null unique,
  referred_by text null,                 -- referral code used during signup
  referral_points integer not null default 0,

  -- vendor extras
  vendor_priority_score integer not null default 0,
  certificate_url text null,

  created_at timestamptz not null default now()
);

-- Avoid duplicate emails per role (vendor + consumer can share same email if you want; if not, remove role)
create unique index if not exists waitlist_entries_email_role_uidx
on public.waitlist_entries (lower(email), role);

-- Helpful index for admin sorting
create index if not exists waitlist_entries_role_created_idx
on public.waitlist_entries (role, created_at desc);

-- RLS (safe default)
alter table public.waitlist_entries enable row level security;

-- Public can INSERT only (for signup)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='waitlist_entries' and policyname='public_insert_waitlist'
  ) then
    create policy public_insert_waitlist
    on public.waitlist_entries
    for insert
    to anon, authenticated
    with check (true);
  end if;
end$$;

-- Public cannot select/update/delete (admin will use service role key)
