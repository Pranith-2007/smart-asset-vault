import type { VaultSnapshot } from './types';
import { isActiveShare } from './selectors';
import { daysSince, daysUntil } from '@/utils/date';
import { expiryLabel } from '@/utils/format';
import { isEmail } from '@/utils/validation';

/**
 * Preferences the person has chosen. In this build they are stored in memory only
 * and NOT enforced: no biometric prompt, no auto-lock, no two-step sign-in exists yet.
 */
export interface SecuritySettings {
  twoStep: boolean;
  biometric: boolean;
  autoLockMinutes: number; // 0 means never
  hidePreviews: boolean;
  recoveryEmail: string;
  loginAlerts: boolean;
  defaultShareExpiryDays: number; // 0 means no expiry
}

export const defaultSecuritySettings: SecuritySettings = {
  twoStep: true,
  biometric: true,
  autoLockMinutes: 5,
  hidePreviews: true,
  recoveryEmail: 'anika.rao@example.com',
  loginAlerts: true,
  defaultShareExpiryDays: 7,
};

export type CheckGroup = 'device' | 'sharing' | 'records';
export const checkGroupTitle: Record<CheckGroup, string> = {
  device: 'Device and sign-in',
  sharing: 'Sharing',
  records: 'Records',
};

export interface SecurityCheck {
  id: string;
  group: CheckGroup;
  label: string;
  met: boolean;
  detail?: string;
  href?: string;
}

export function computeChecks(s: SecuritySettings, snap: VaultSnapshot): SecurityCheck[] {
  const docTitle = (id: string) => snap.documents.find((d) => d.id === id)?.title ?? 'a document';
  const activeShares = snap.shares.filter(isActiveShare);
  const openEnded = activeShares.filter((x) => !x.expiresOn);
  const stale = activeShares.filter((x) => daysSince(x.createdOn) > 90);
  const bare = snap.assets.filter((a) => !snap.documents.some((d) => d.assetId === a.id));
  const expired = snap.documents.filter((d) => d.expiresOn && daysUntil(d.expiresOn) < 0);
  const soon = snap.documents.filter((d) => d.expiresOn && daysUntil(d.expiresOn) >= 0 && daysUntil(d.expiresOn) <= 60);
  const more = (n: number) => (n > 1 ? ` and ${n - 1} more` : '');

  const device = (id: string, label: string, met: boolean): SecurityCheck => ({ id, group: 'device', label, met, href: '/security' });

  return [
    device('twoStep', 'Two-step sign-in is on', s.twoStep),
    device('biometric', 'Biometric unlock is on', s.biometric),
    device('autoLock', 'Vault locks automatically', s.autoLockMinutes > 0),
    device('hidePreviews', 'Previews hidden in app switcher', s.hidePreviews),
    device('recovery', 'Recovery contact is set', isEmail(s.recoveryEmail)),
    device('loginAlerts', 'Sign-in alerts are on', s.loginAlerts),
    { id: 'defaultExpiry', group: 'sharing', label: 'New shares expire by default', met: s.defaultShareExpiryDays > 0, href: '/security' },
    {
      id: 'openEnded', group: 'sharing', label: 'No open-ended shares', met: openEnded.length === 0,
      detail: openEnded[0] && `${openEnded[0].recipientName} has open-ended access to ${docTitle(openEnded[0].documentId)}${more(openEnded.length)}`,
      href: openEnded[0] && `/share/${openEnded[0].id}`,
    },
    {
      id: 'stale', group: 'sharing', label: 'No share older than 90 days', met: stale.length === 0,
      detail: stale[0] && `${stale[0].recipientName} has had access to ${docTitle(stale[0].documentId)} for ${daysSince(stale[0].createdOn)} days${more(stale.length)}`,
      href: stale[0] && `/share/${stale[0].id}`,
    },
    {
      id: 'assetDocs', group: 'records', label: 'Every asset has a document', met: bare.length === 0,
      detail: bare[0] && `${bare[0].name} has no documents${more(bare.length)}`,
      href: bare[0] && `/asset/${bare[0].id}`,
    },
    {
      id: 'expiredDocs', group: 'records', label: 'No documents past expiry', met: expired.length === 0,
      detail: expired[0] && `${expired[0].title}: ${expiryLabel(expired[0].expiresOn).toLowerCase()}${more(expired.length)}`,
      href: expired[0] && `/document/${expired[0].id}`,
    },
    {
      id: 'expiringDocs', group: 'records', label: 'Nothing expires within 60 days', met: soon.length === 0,
      detail: soon[0] && `${soon[0].title}: ${expiryLabel(soon[0].expiresOn).toLowerCase()}${more(soon.length)}`,
      href: soon[0] && `/document/${soon[0].id}`,
    },
  ];
}
