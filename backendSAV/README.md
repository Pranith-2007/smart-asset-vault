# Smart Asset Vault — Backend

This folder contains backend-related work for Smart Asset Vault.

## Architecture

- Supabase Auth: user authentication
- Supabase PostgreSQL: database and metadata
- Row Level Security (RLS): access control
- Supabase Storage: private document storage
- Supabase Edge Functions: trusted server-side operations when required

## Folder structure

- supabase/migrations/ — version-controlled SQL schema changes and policies
- supabase/functions/ — server-side Edge Functions
- docs/ — architecture, setup, and API documentation

## Security rules

- Never commit .env files or API secrets.
- Never expose a Supabase service-role key in the frontend.
- Keep sensitive documents in private storage buckets.
- Enforce authorization with RLS policies.
- Do not store users' external account passwords.

## Current status

Authentication is integrated in the frontend.
Vault database and document storage integration remain to be completed.
