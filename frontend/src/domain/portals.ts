import type { IconName } from '@/components/Icon';

/**
 * The three ways into the app. A portal is only a UI choice made before sign-in.
 * It does NOT authenticate anyone or grant any access. What an account may see
 * has to be enforced by the backend (for example Supabase row-level security).
 */
export type PortalId = 'personal' | 'organisation' | 'government';

export interface Portal {
  id: PortalId;
  title: string;
  audience: string;
  summary: string;
  /** Intro line on the sign-in screen for this portal. */
  signInIntro: string;
  icon: IconName;
}

export const portals: Record<PortalId, Portal> = {
  personal: {
    id: 'personal',
    title: 'Personal Vault',
    audience: 'For individuals',
    summary: 'Manage your assets, ownership records and identity documents, and control who can access or view them.',
    signInIntro: 'Store ownership documents, keep track of what you own, and share access only for as long as you intend.',
    icon: 'user',
  },
  organisation: {
    id: 'organisation',
    title: 'Organisation Portal',
    audience: 'For organisations and their employees',
    summary: 'Open asset records and documents that owners have explicitly shared with your organisation. Private records stay out of reach without permission.',
    signInIntro: 'See the records and documents that owners have explicitly shared with your organisation, and nothing else.',
    icon: 'briefcase',
  },
  government: {
    id: 'government',
    title: 'Government Portal',
    audience: 'For authorised government officials',
    summary: 'Verify ownership records and identity documents for legitimate official purposes. Access is permission-controlled and auditable.',
    signInIntro: 'Verify ownership and identity records for legitimate official purposes. Access is permission-controlled and auditable.',
    icon: 'flag',
  },
};

export const portalOrder: PortalId[] = ['personal', 'organisation', 'government'];

/** Reads a route param safely. Returns null for anything that isn't a known portal. */
export function parsePortal(value: unknown): PortalId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return portalOrder.find((id) => id === raw) ?? null;
}