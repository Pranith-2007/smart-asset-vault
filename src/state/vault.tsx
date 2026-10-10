import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { vaultRepository, RepositoryError } from '@/services';
import type { Mutation } from '@/services/vaultRepository';
import type { NewAsset, NewDocument, NewShare, SharePatch, VaultSnapshot } from '@/domain/types';
import { emptySnapshot } from '@/data/mock/fixtures';
import { useSession } from './session';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface VaultValue extends VaultSnapshot {
  status: Status;
  error: string | null;
  reload: () => Promise<void>;
  /** Silent refresh for pull-to-refresh. Resolves false on failure and keeps current data. */
  refresh: () => Promise<boolean>;
  registerAsset: (i: NewAsset) => Promise<string>;
  addDocument: (i: NewDocument) => Promise<string>;
  createShare: (i: NewShare) => Promise<string>;
  updateShare: (id: string, p: SharePatch) => Promise<void>;
  revokeShare: (id: string) => Promise<void>;
}

const Ctx = createContext<VaultValue | null>(null);
const messageOf = (e: unknown) => (e instanceof RepositoryError ? e.message : 'Something went wrong. Try again.');

export function VaultProvider({ children }: { children: ReactNode }) {
  const { inPreview, epoch } = useSession();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VaultSnapshot>(emptySnapshot());

  const reload = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setData(await vaultRepository.load());
      setStatus('ready');
    } catch (e) {
      setError(messageOf(e));
      setStatus('error');
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setData(await vaultRepository.load());
      setStatus('ready');
      setError(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (inPreview) void reload();
    else {
      setData(emptySnapshot());
      setStatus('idle');
    }
  }, [inPreview, epoch, reload]);

  const apply = useCallback(async <T,>(run: () => Promise<Mutation<T>>): Promise<T> => {
    const m = await run();
    setData(m.snapshot);
    return m.result;
  }, []);

  const value = useMemo<VaultValue>(
    () => ({
      ...data,
      status,
      error,
      reload,
      refresh,
      registerAsset: async (i) => (await apply(() => vaultRepository.registerAsset(i))).id,
      addDocument: async (i) => (await apply(() => vaultRepository.addDocument(i))).id,
      createShare: async (i) => (await apply(() => vaultRepository.createShare(i))).id,
      updateShare: async (id, p) => void (await apply(() => vaultRepository.updateShare(id, p))),
      revokeShare: async (id) => void (await apply(() => vaultRepository.revokeShare(id))),
    }),
    [data, status, error, reload, refresh, apply],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useVault must be used inside VaultProvider');
  return v;
}

export { messageOf as repositoryMessage };
