import type { Asset, NewAsset, NewDocument, NewShare, Share, SharePatch, VaultDocument, VaultSnapshot } from '@/domain/types';

/** Thrown by any repository call that fails. Screens show `message` to the person. */
export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export interface Mutation<T> {
  /** Full vault state after the change, so the store never has to guess. */
  snapshot: VaultSnapshot;
  result: T;
}

/**
 * The contract between the UI and its data source.
 *
 * Today `mockVaultRepository` (src/data/mock) implements this in memory.
 * When Supabase is integrated, write `supabaseVaultRepository` against this
 * same interface and change the one export in `src/services/index.ts`.
 * No screen or component needs to change.
 */
export interface VaultRepository {
  load(): Promise<VaultSnapshot>;
  registerAsset(input: NewAsset): Promise<Mutation<Asset>>;
  addDocument(input: NewDocument): Promise<Mutation<VaultDocument>>;
  createShare(input: NewShare): Promise<Mutation<Share>>;
  deleteDocument(id: string): Promise<void>;
  updateShare(id: string, patch: SharePatch): Promise<Mutation<Share>>;
  revokeShare(id: string): Promise<Mutation<Share>>;
}
