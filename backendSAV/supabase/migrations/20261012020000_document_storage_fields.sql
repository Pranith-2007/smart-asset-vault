-- Additive migration for the existing Smart Asset Vault migrations.
-- Run only after the assets and access-management migrations have succeeded.

alter table public.documents
  add column if not exists file_name text,
  add column if not exists kind text not null default 'other',
  add column if not exists expires_on timestamptz,
  add column if not exists certified_copy boolean not null default false;

-- Private bucket. Existing bucket settings are not overwritten.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 26214400, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Users can manage only objects whose first path segment is their auth UUID.
drop policy if exists "vault_documents_owner_select" on storage.objects;
create policy "vault_documents_owner_select" on storage.objects
for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault_documents_owner_insert" on storage.objects;
create policy "vault_documents_owner_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault_documents_owner_update" on storage.objects;
create policy "vault_documents_owner_update" on storage.objects
for update to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault_documents_owner_delete" on storage.objects;
create policy "vault_documents_owner_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
