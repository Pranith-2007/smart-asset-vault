import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockControls, type PreviewDataMode } from '@/data/mock/mockRepository';
import { mockUser } from '@/data/mock/fixtures';
import type { UserProfile } from '@/domain/types';

/**
 * Preview session. This is NOT authentication: there is no account, token or credential.
 * It only records that the person chose to explore the app with sample data.
 * Replace with a real Supabase session provider when the backend lands.
 */
interface SessionValue {
  inPreview: boolean;
  user: UserProfile;
  enterPreview: () => void;
  exitPreview: () => void;
  dataMode: PreviewDataMode;
  setDataMode: (m: PreviewDataMode) => void;
  resetSampleData: () => void;
  /** Bumps whenever the vault should reload from the repository. */
  epoch: number;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [inPreview, setInPreview] = useState(false);
  const [dataMode, setMode] = useState<PreviewDataMode>('normal');
  const [epoch, setEpoch] = useState(0);

  const enterPreview = useCallback(() => {
    setInPreview(true);
    setEpoch((e) => e + 1);
  }, []);
  const exitPreview = useCallback(() => {
    mockControls.setMode('normal');
    mockControls.reset();
    setMode('normal');
    setInPreview(false);
  }, []);
  const setDataMode = useCallback((m: PreviewDataMode) => {
    mockControls.setMode(m);
    setMode(m);
    setEpoch((e) => e + 1);
  }, []);
  const resetSampleData = useCallback(() => {
    mockControls.reset();
    setEpoch((e) => e + 1);
  }, []);

  const value = useMemo(
    () => ({ inPreview, user: mockUser, enterPreview, exitPreview, dataMode, setDataMode, resetSampleData, epoch }),
    [inPreview, enterPreview, exitPreview, dataMode, setDataMode, resetSampleData, epoch],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside SessionProvider');
  return v;
}
