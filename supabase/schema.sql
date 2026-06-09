-- Run this once in the Supabase SQL editor.

create table if not exists meetme (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  phone text not null,
  data jsonb not null default '[]',
  edit_token text unique not null,
  created_at timestamptz default now()
);

create index if not exists meetme_slug_idx on meetme (slug);
create index if not exists meetme_edit_token_idx on meetme (edit_token);

alter table meetme enable row level security;

-- Public read (profile lookup by slug)
drop policy if exists meetme_select on meetme;
create policy meetme_select on meetme
  for select using (true);

-- Public insert (anyone can create a MeetMe)
drop policy if exists meetme_insert on meetme;
create policy meetme_insert on meetme
  for insert with check (true);

-- Public update: edit_token in the URL is the secret.
-- Anon can update any row; the API gates this by matching edit_token.
drop policy if exists meetme_update on meetme;
create policy meetme_update on meetme
  for update using (true) with check (true);
