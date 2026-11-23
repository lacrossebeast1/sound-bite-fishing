-- Sound Bite Fishing: private user catch log
-- Run this entire file in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  species text not null check (char_length(trim(species)) between 1 and 80),
  caught_at timestamptz not null default now(),
  location text not null default '',
  lure text not null default '',
  weather text not null default '',
  tide_conditions text not null default '',
  notes text,
  photo_path text,
  created_at timestamptz not null default now()
);

create index if not exists catches_user_caught_at_idx on public.catches (user_id, caught_at desc);
alter table public.catches enable row level security;

drop policy if exists "Users can read their own catches" on public.catches;
create policy "Users can read their own catches" on public.catches for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can add their own catches" on public.catches;
create policy "Users can add their own catches" on public.catches for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can edit their own catches" on public.catches;
create policy "Users can edit their own catches" on public.catches for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own catches" on public.catches;
create policy "Users can delete their own catches" on public.catches for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catch-photos', 'catch-photos', false, 8388608, array['image/jpeg','image/png','image/webp','image/gif','image/heic'])
on conflict (id) do update set public = false, file_size_limit = 8388608, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own catch photos" on storage.objects;
create policy "Users can view their own catch photos" on storage.objects for select to authenticated using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can upload their own catch photos" on storage.objects;
create policy "Users can upload their own catch photos" on storage.objects for insert to authenticated with check (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can update their own catch photos" on storage.objects;
create policy "Users can update their own catch photos" on storage.objects for update to authenticated using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can delete their own catch photos" on storage.objects;
create policy "Users can delete their own catch photos" on storage.objects for delete to authenticated using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);
