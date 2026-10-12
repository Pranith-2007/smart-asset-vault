# Backend Architecture

## 1. Authentication
Supabase Auth manages registration, login, sessions, and logout.

## 2. Database
PostgreSQL stores asset metadata, ownership, document categories, and related records.

## 3. Authorization
RLS policies restrict each user to authorized records. Policies must be reviewed before production use.

## 4. Document storage
Use a private Supabase Storage bucket for sensitive documents. Validate access and file ownership before allowing uploads or downloads.

## 5. Edge Functions
Use Edge Functions for operations requiring trusted server-side logic. Keep privileged keys and secrets server-side.

## 6. External credentials
Store account references and official login URLs only. Do not store external account passwords.

## 7. Implementation order
1. Inspect the existing database and assets table.
2. Review current ownership-based RLS policies.
3. Design only the missing schema changes.
4. Create and review migrations.
5. Configure private document storage and access policies.
6. Connect frontend vault operations.
7. Test authorization, logout, and cross-user access.
