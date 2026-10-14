
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { vaultRepository, previewVaultRepository, RepositoryError } from '@/services';
import type { Mutation } from '@/services/vaultRepository';
import type {
  NewAsset,
  NewDocument,
  NewShare,
  SharePatch,
  VaultSnapshot,
} from '@/domain/types';
import { emptySnapshot } from '@/data/mock/fixtures';
import { useSession } from './session';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface VaultValue extends VaultSnapshot {
  status: Status;
  error: string | null;
  reload: () => Promise<void>;
  refresh: () => Promise<boolean>;
  registerAsset: (i: NewAsset) => Promise<string>;
  addDocument: (i: NewDocument) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  createShare: (i: NewShare) => Promise<string>;
  updateShare: (id: string, p: SharePatch) => Promise<void>;
  revokeShare: (id: string) => Promise<void>;
}

const Ctx = createContext<VaultValue | null>(null);

const messageOf = (e: unknown) =>
  e instanceof RepositoryError
    ? e.message
    : e instanceof Error
      ? e.message
      : 'Something went wrong. Try again.';

export function VaultProvider({ children }: { children: ReactNode }) {
  const { inPreview, isAuthenticated, isLoading, epoch } = useSession();

  const repository = inPreview ? previewVaultRepository : vaultRepository;

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VaultSnapshot>(emptySnapshot());

  const reload = useCallback(async () => {
    if (isLoading) return;

    if (!inPreview && !isAuthenticated) {
      setData(emptySnapshot());
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      setData(await repository.load());
      setStatus('ready');
    } catch (e) {
      setError(messageOf(e));
      setStatus('error');
    }
  }, [repository, inPreview, isAuthenticated, isLoading]);

  const refresh = useCallback(async () => {
    if (isLoading || (!inPreview && !isAuthenticated)) return false;

    try {
      setData(await repository.load());
      setStatus('ready');
      setError(null);
      return true;
    } catch {
      return false;
    }
  }, [repository, inPreview, isAuthenticated, isLoading]);

  useEffect(() => {
    void reload();
  }, [reload, epoch]);

  const apply = useCallback(
    async <T,>(run: () => Promise<Mutation<T>>): Promise<T> => {
      if (isLoading || (!inPreview && !isAuthenticated)) {
        throw new RepositoryError('Please sign in to use your vault.');
      }

      const result = await run();
      setData(result.snapshot);
      return result.result;
    },
    [isLoading, inPreview, isAuthenticated],
  );

  const value = useMemo<VaultValue>(
    () => ({
      ...data,
      status,
      error,
      reload,
      refresh,
      registerAsset: async (i) =>
        (await apply(() => repository.registerAsset(i))).id,
      addDocument: async (i) =>
        (await apply(() => repository.addDocument(i))).id,
      createShare: async (i) =>
        (await apply(() => repository.createShare(i))).id,
      
deleteDocument: async (id) => {
  if (isLoading || (!inPreview && !isAuthenticated)) {
    throw new RepositoryError('Please sign in to use your vault.');
  }

  await repository.deleteDocument(id);

  const refreshed = await refresh();

  if (!refreshed) {
    throw new RepositoryError(
      'Document was deleted, but the list could not be refreshed. Please reload your vault.',
    );
  }
},

      updateShare: async (id, p) => {
        await apply(() => repository.updateShare(id, p));
      },
      revokeShare: async (id) => {
        await apply(() => repository.revokeShare(id));
      },
    }),
    [data, status, error, reload, refresh, apply, repository],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useVault must be used inside VaultProvider');
  return value;
}

export { messageOf as repositoryMessage };
