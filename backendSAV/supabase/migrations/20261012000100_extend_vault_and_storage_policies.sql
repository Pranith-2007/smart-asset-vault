-- Smart Asset Vault: extend existing schema for the frontend.
-- This migration preserves existing tables and records.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS folio text
    DEFAULT ('AV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

CREATE UNIQUE INDEX IF NOT EXISTS assets_folio_unique
  ON public.assets (folio);

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS expires_on timestamptz,
  ADD COLUMN IF NOT EXISTS certified_copy boolean NOT NULL DEFAULT false;

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_kind_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_kind_check
  CHECK (kind IN ('ownership', 'insurance', 'identity', 'tax', 'contract', 'invoice', 'other'));

-- Backfill filenames for existing document records.
UPDATE public.documents
SET file_name = COALESCE(
  NULLIF(file_name, ''),
  NULLIF(
    split_part(storage_path, '/', array_length(string_to_array(storage_path, '/'), 1)),
    ''
  ),
  name
)
WHERE file_name IS NULL OR file_name = '';

-- Private Storage access: files must be stored under
-- <authenticated-user-uuid>/<document-uuid>/<filename>.
-- Shared-file access will be added separately after verification.

DROP POLICY IF EXISTS "vault_documents_insert_own" ON storage.objects;
CREATE POLICY "vault_documents_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "vault_documents_select_own" ON storage.objects;
CREATE POLICY "vault_documents_select_own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vault-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "vault_documents_update_own" ON storage.objects;
CREATE POLICY "vault_documents_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vault-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
)
WITH CHECK (
  bucket_id = 'vault-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "vault_documents_delete_own" ON storage.objects;
CREATE POLICY "vault_documents_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
