-- Migration: create public.assets (Smart Asset Vault)
-- Assumes Supabase (auth.users). Safe to re-run.

create table if not exists public.assets (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users (id) on delete cascade,
  asset_name               text not null,
  category                 text not null,
  location_or_registration text,
  acquired_on              date,
  declared_value           numeric(15,2) not null,
  status                   text not null default 'active',
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Constraints (added separately so they can be applied if the table already exists)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'assets_asset_name_not_blank') then
    alter table public.assets
      add constraint assets_asset_name_not_blank check (length(btrim(asset_name)) > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_category_check') then
    alter table public.assets
      add constraint assets_category_check
      check (category in ('property','vehicle','equipment','investment','collectible','other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_status_check') then
    alter table public.assets
      add constraint assets_status_check
      check (status in ('active','pledged_as_security'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_declared_value_nonneg') then
    alter table public.assets
      add constraint assets_declared_value_nonneg check (declared_value >= 0);
  end if;
end $$;

create index if not exists assets_user_id_idx on public.assets (user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.assets enable row level security;

drop policy if exists "assets_select_own" on public.assets;
create policy "assets_select_own" on public.assets
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "assets_insert_own" on public.assets;
create policy "assets_insert_own" on public.assets
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "assets_update_own" on public.assets;
create policy "assets_update_own" on public.assets
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "assets_delete_own" on public.assets;
create policy "assets_delete_own" on public.assets
  for delete to authenticated
  using (auth.uid() = user_id);
