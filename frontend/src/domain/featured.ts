import type { IconName } from '@/components/Icon';
import type { Asset, VaultDocument, VaultSnapshot } from './types';

/** The important document types shown as cards at the top of the home screen. */
export type FeaturedKey = 'aadhaar' | 'passport' | 'house';

export interface FeaturedType {
  key: FeaturedKey;
  title: string;
  icon: IconName;
  tint: 'blue' | 'saffron' | 'green';
  /** One plain sentence under the title. */
  blurb: string;
  /** Add-document form presets used when nothing is stored yet. */
  preset: { kind: VaultDocument['kind']; title: string };
}

export const featuredTypes: FeaturedType[] = [
  { key: 'aadhaar', title: 'Aadhaar Card', icon: 'credit-card', tint: 'blue', blurb: 'Your identity proof', preset: { kind: 'identity', title: 'Aadhaar card' } },
  { key: 'passport', title: 'Passport', icon: 'book-open', tint: 'saffron', blurb: 'For travel and identity', preset: { kind: 'identity', title: 'Passport copy' } },
  { key: 'house', title: 'House Documents', icon: 'home', tint: 'green', blurb: 'Deed, tax and insurance for your home', preset: { kind: 'ownership', title: '' } },
];

export const parseFeatured = (v: unknown): FeaturedKey | null => {
  const raw = Array.isArray(v) ? v[0] : v;
  return featuredTypes.find((t) => t.key === raw)?.key ?? null;
};

const isHouse = (a: Asset) => a.category === 'property' && /flat|house|home|apartment|villa/i.test(a.name);

/** The stored documents that belong under a featured card. */
export function featuredDocuments(key: FeaturedKey, snap: Pick<VaultSnapshot, 'documents' | 'assets'>): VaultDocument[] {
  if (key === 'aadhaar') return snap.documents.filter((d) => /aadhaar|aadhar/i.test(d.title));
  if (key === 'passport') return snap.documents.filter((d) => /passport/i.test(d.title));
  const houseIds = new Set(snap.assets.filter(isHouse).map((a) => a.id));
  return snap.documents.filter((d) => d.assetId !== null && houseIds.has(d.assetId));
}
