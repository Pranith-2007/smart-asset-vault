import type { Share, ShareState, VaultSnapshot } from './types';

export const shareState = (s: Share, at: Date = new Date()): ShareState =>
  s.revokedOn ? 'revoked' : s.expiresOn && new Date(s.expiresOn) <= at ? 'expired' : 'active';

export const isActiveShare = (s: Share) => shareState(s) === 'active';

export const sharesForDocument = (snap: VaultSnapshot, documentId: string) =>
  snap.shares.filter((s) => s.documentId === documentId);

export const documentsForAsset = (snap: VaultSnapshot, assetId: string) =>
  snap.documents.filter((d) => d.assetId === assetId);

export const totalDeclaredValue = (snap: VaultSnapshot) =>
  snap.assets.reduce((sum, a) => sum + a.declaredValue, 0);

import type { ActivityEvent } from './types';

/** Where tapping an activity entry should lead. */
export function activityHref(e: ActivityEvent): string | undefined {
  if (e.shareId) return `/share/${e.shareId}`;
  if (e.documentId) return `/document/${e.documentId}`;
  if (e.assetId) return `/asset/${e.assetId}`;
  return undefined;
}
