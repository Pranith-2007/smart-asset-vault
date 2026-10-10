import type { AccessLevel, ActivityKind, AssetCategory, DocumentKind } from './types';
import type { IconName } from '@/components/Icon';

export const categoryMeta: Record<AssetCategory, { label: string; plural: string; icon: IconName }> = {
  property: { label: 'Property', plural: 'Property', icon: 'home' },
  vehicle: { label: 'Vehicle', plural: 'Vehicles', icon: 'truck' },
  equipment: { label: 'Equipment', plural: 'Equipment', icon: 'tool' },
  investment: { label: 'Investment', plural: 'Investments', icon: 'trending-up' },
  collectible: { label: 'Collectible', plural: 'Collectibles', icon: 'award' },
  other: { label: 'Other', plural: 'Other', icon: 'package' },
};

export const kindMeta: Record<DocumentKind, { label: string; plural: string; icon: IconName }> = {
  ownership: { label: 'Ownership', plural: 'Ownership', icon: 'file-text' },
  insurance: { label: 'Insurance', plural: 'Insurance', icon: 'shield' },
  identity: { label: 'Identity', plural: 'Identity', icon: 'user' },
  tax: { label: 'Tax', plural: 'Tax', icon: 'file' },
  contract: { label: 'Contract', plural: 'Contracts', icon: 'edit-3' },
  invoice: { label: 'Invoice', plural: 'Invoices', icon: 'clipboard' },
  other: { label: 'Other', plural: 'Other', icon: 'paperclip' },
};

export const accessLabel: Record<AccessLevel, string> = {
  view: 'View only',
  download: 'View and download',
};

export const activityIcon: Record<ActivityKind, IconName> = {
  registered: 'plus-circle',
  uploaded: 'upload',
  shared: 'send',
  viewed: 'eye',
  downloaded: 'download',
  updated: 'edit-2',
  revoked: 'slash',
  expired: 'clock',
};
