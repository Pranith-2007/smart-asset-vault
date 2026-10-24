import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { computeChecks, defaultSecuritySettings, type SecurityCheck, type SecuritySettings } from '@/domain/security';
import { useVault } from './vault';

interface SecurityValue {
  settings: SecuritySettings;
  update: (patch: Partial<SecuritySettings>) => void;
  checks: SecurityCheck[];
  met: number;
  total: number;
}

const Ctx = createContext<SecurityValue | null>(null);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const { assets, documents, shares, activity } = useVault();
  const update = useCallback((p: Partial<SecuritySettings>) => setSettings((s) => ({ ...s, ...p })), []);

  const value = useMemo(() => {
    const checks = computeChecks(settings, { assets, documents, shares, receivedShares: [],activity });
    return { settings, update, checks, met: checks.filter((c) => c.met).length, total: checks.length };
  }, [settings, update, assets, documents, shares, activity]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSecurity() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSecurity must be used inside SecurityProvider');
  return v;
}
