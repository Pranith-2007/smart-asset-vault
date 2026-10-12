
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { mockControls, type PreviewDataMode } from '@/data/mock/mockRepository';
import { mockUser } from '@/data/mock/fixtures';
import type { UserProfile } from '@/domain/types';
import { supabase } from '@/lib/supabase';

interface SessionValue {
  inPreview: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile;
  enterPreview: () => void;
  exitPreview: () => void;
  signOut: () => Promise<void>;
  dataMode: PreviewDataMode;
  setDataMode: (m: PreviewDataMode) => void;
  resetSampleData: () => void;
  epoch: number;
}

const Ctx = createContext<SessionValue | null>(null);

function toUserProfile(user: User): UserProfile {
  const name =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : user.email?.split('@')[0] ?? 'Account';

  return {
    name,
    firstName: name.trim().split(/\s+/)[0] || 'Account',
    email: user.email ?? '',
    memberSince: user.created_at.slice(0, 10),
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [inPreview, setInPreview] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataMode, setMode] = useState<PreviewDataMode>('normal');
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthUser(session?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error('Could not restore Supabase session:', error.message);
          setAuthUser(null);
        } else {
          setAuthUser(data.session?.user ?? null);
        }

        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        console.error('Could not restore Supabase session:', error);
        setAuthUser(null);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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

  const isAuthenticated = authUser !== null;
  const user = useMemo(
    () => (inPreview || !authUser ? mockUser : toUserProfile(authUser)),
    [inPreview, authUser],
  );

  const value = useMemo(
    () => ({
      inPreview,
      isAuthenticated,
      isLoading,
      user,
      enterPreview,
      exitPreview,
      signOut,
      dataMode,
      setDataMode,
      resetSampleData,
      epoch,
    }),
    [
      inPreview,
      isAuthenticated,
      isLoading,
      user,
      enterPreview,
      exitPreview,
      signOut,
      dataMode,
      setDataMode,
      resetSampleData,
      epoch,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
