-- Migration: Access management (documents, document_shares, access_events)
-- Depends on: public.assets and public.set_updated_at() from the assets migration.
-- Design: clients can only SELECT. All writes to shares/events go through
-- SECURITY DEFINER functions that check ownership and write the audit event
-- in the same transaction.
-- ASSUMPTIONS (confirm before applying): recipients are identified by email
-- (linked to auth.users when an account exists); grants are per document;
-- "expired" is derived (status = 'active' and expires_at <= now()).

-- ---------------------------------------------------------------- documents
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  asset_id      uuid references public.assets (id) on delete set null,
  name          text not null check (length(btrim(name)) > 0),
  storage_path  text not null,
  mime_type     text,
  size_bytes    bigint check (size_bytes is null or size_bytes >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists documents_owner_id_idx on public.documents (owner_id);
create index if not exists documents_asset_id_idx on public.documents (asset_id);

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------- document_shares
create table if not exists public.document_shares (
  id               uuid primary key default gen_random_uuid(),
  document_id      uuid not null references public.documents (id) on delete restrict,
  owner_id         uuid not null references auth.users (id) on delete restrict,
  recipient_id     uuid references auth.users (id) on delete set null,
  recipient_email  text not null check (position('@' in recipient_email) > 1),
  recipient_name   text,
  permission       text not null default 'view' check (permission in ('view','download')),
  status           text not null default 'active' check (status in ('active','revoked')),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz,            -- null = no expiry
  revoked_at       timestamptz,
  revoked_by       uuid references auth.users (id),
  constraint document_shares_revoked_consistent
    check ((status = 'revoked') = (revoked_at is not null))
);
create index if not exists document_shares_owner_idx     on public.document_shares (owner_id, status);
create index if not exists document_shares_recipient_idx on public.document_shares (recipient_id);
create index if not exists document_shares_email_idx     on public.document_shares (lower(recipient_email));
create index if not exists document_shares_document_idx  on public.document_shares (document_id);
create unique index if not exists document_shares_one_active_per_recipient
  on public.document_shares (document_id, lower(recipient_email)) where status = 'active';

-- ------------------------------------------------------------ access_events
create table if not exists public.access_events (
  id               uuid primary key default gen_random_uuid(),
  share_id         uuid references public.document_shares (id) on delete restrict,
  document_id      uuid references public.documents (id) on delete set null,
  owner_id         uuid not null references auth.users (id) on delete restrict,
  actor_id         uuid references auth.users (id) on delete set null,
  recipient_email  text,
  event_type       text not null check (event_type in (
                     'granted','viewed','downloaded','expiry_extended',
                     'permission_changed','revoked','expired')),
  details          jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists access_events_owner_idx on public.access_events (owner_id, created_at desc);
create index if not exists access_events_share_idx on public.access_events (share_id, created_at desc);

-- --------------------------------------------------------------------- RLS
alter table public.documents       enable row level security;
alter table public.document_shares enable row level security;
alter table public.access_events   enable row level security;

-- documents: owners manage their own rows
drop policy if exists "documents_owner_all" on public.documents;
create policy "documents_owner_all" on public.documents
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- documents: recipients can read metadata of documents with a live grant
drop policy if exists "documents_recipient_select" on public.documents;
create policy "documents_recipient_select" on public.documents
  for select to authenticated
  using (exists (
    select 1 from public.document_shares s
    where s.document_id = documents.id
      and s.status = 'active'
      and (s.expires_at is null or s.expires_at > now())
      and (s.recipient_id = auth.uid()
           or lower(s.recipient_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  ));

-- document_shares: SELECT only (owner or recipient). No client writes.
drop policy if exists "shares_select_owner_or_recipient" on public.document_shares;
create policy "shares_select_owner_or_recipient" on public.document_shares
  for select to authenticated
  using (owner_id = auth.uid()
         or recipient_id = auth.uid()
         or lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- access_events: owners can read their events. No client writes.
drop policy if exists "events_select_owner" on public.access_events;
create policy "events_select_owner" on public.access_events
  for select to authenticated
  using (owner_id = auth.uid());

revoke insert, update, delete on public.document_shares from anon, authenticated;
revoke insert, update, delete on public.access_events   from anon, authenticated;

-- ------------------------------------------------------------ RPC functions
create or replace function public._log_access_event(
  p_share public.document_shares, p_type text, p_details jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.access_events
    (share_id, document_id, owner_id, actor_id, recipient_email, event_type, details)
  values
    (p_share.id, p_share.document_id, p_share.owner_id, auth.uid(),
     p_share.recipient_email, p_type, p_details);
$$;
revoke all on function public._log_access_event(public.document_shares, text, jsonb) from public, anon, authenticated;

create or replace function public.grant_access(
  p_document_id uuid, p_recipient_email text, p_permission text default 'view',
  p_expires_at timestamptz default null, p_recipient_name text default null)
returns public.document_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doc public.documents;
  v_rid uuid;
  v_share public.document_shares;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into v_doc from public.documents where id = p_document_id and owner_id = auth.uid();
  if not found then raise exception 'document not found or not owned by you'; end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'expiry must be in the future';
  end if;
  select id into v_rid from auth.users where lower(email) = lower(btrim(p_recipient_email));
  if v_rid = auth.uid() then raise exception 'cannot share with yourself'; end if;

  insert into public.document_shares
    (document_id, owner_id, recipient_id, recipient_email, recipient_name, permission, expires_at)
  values
    (p_document_id, auth.uid(), v_rid, lower(btrim(p_recipient_email)), p_recipient_name,
     p_permission, p_expires_at)
  returning * into v_share;

  perform public._log_access_event(v_share, 'granted',
    jsonb_build_object('permission', p_permission, 'expires_at', p_expires_at));
  return v_share;
end;
$$;

-- p_new_expires_at = null means "No expiry"
create or replace function public.extend_access(p_share_id uuid, p_new_expires_at timestamptz)
returns public.document_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.document_shares;
  v_new public.document_shares;
begin
  select * into v_old from public.document_shares
   where id = p_share_id and owner_id = auth.uid() for update;
  if not found then raise exception 'grant not found'; end if;
  if v_old.status <> 'active' then raise exception 'grant is revoked'; end if;
  if p_new_expires_at is not null and p_new_expires_at <= now() then
    raise exception 'expiry must be in the future';
  end if;

  update public.document_shares set expires_at = p_new_expires_at
   where id = p_share_id returning * into v_new;

  perform public._log_access_event(v_new, 'expiry_extended',
    jsonb_build_object('from', v_old.expires_at, 'to', p_new_expires_at));
  return v_new;
end;
$$;

create or replace function public.change_access_permission(p_share_id uuid, p_permission text)
returns public.document_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.document_shares;
  v_new public.document_shares;
begin
  select * into v_old from public.document_shares
   where id = p_share_id and owner_id = auth.uid() for update;
  if not found then raise exception 'grant not found'; end if;
  if v_old.status <> 'active' then raise exception 'grant is revoked'; end if;
  if p_permission not in ('view','download') then raise exception 'invalid permission'; end if;

  update public.document_shares set permission = p_permission
   where id = p_share_id returning * into v_new;

  perform public._log_access_event(v_new, 'permission_changed',
    jsonb_build_object('from', v_old.permission, 'to', p_permission));
  return v_new;
end;
$$;

create or replace function public.revoke_access(p_share_id uuid)
returns public.document_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new public.document_shares;
begin
  update public.document_shares
     set status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   where id = p_share_id and owner_id = auth.uid() and status = 'active'
   returning * into v_new;
  if not found then raise exception 'active grant not found'; end if;

  perform public._log_access_event(v_new, 'revoked');
  return v_new;
end;
$$;

grant execute on function public.grant_access(uuid, text, text, timestamptz, text) to authenticated;
grant execute on function public.extend_access(uuid, timestamptz)                  to authenticated;
grant execute on function public.change_access_permission(uuid, text)              to authenticated;
grant execute on function public.revoke_access(uuid)                               to authenticated;
revoke execute on function public.grant_access(uuid, text, text, timestamptz, text) from anon, public;
revoke execute on function public.extend_access(uuid, timestamptz)                  from anon, public;
revoke execute on function public.change_access_permission(uuid, text)              from anon, public;
revoke execute on function public.revoke_access(uuid)                               from anon, public;
