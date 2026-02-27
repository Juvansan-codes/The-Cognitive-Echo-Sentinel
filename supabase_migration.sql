-- Cognitive Echo Sentinel — Supabase migration
-- Run this in the Supabase SQL Editor before using the app

create table if not exists public.assessments (
    id               bigint generated always as identity primary key,
    session_id       text             not null,
    recorded_at      timestamptz      not null default now(),
    duration_seconds real,
    acoustic_score   real,
    cognitive_score  real,
    neuro_risk_level text,
    acoustic_confidence real,
    cognitive_available boolean default true,
    transcript       text
);

-- Index for fast history queries
create index if not exists idx_assessments_recorded_at
    on public.assessments (recorded_at desc);

-- Allow anonymous reads and inserts (anon key only)
alter table public.assessments enable row level security;

create policy "Allow anon insert"
    on public.assessments
    for insert
    to anon
    with check (true);

create policy "Allow anon select"
    on public.assessments
    for select
    to anon
    using (true);
