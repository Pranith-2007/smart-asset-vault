export type AssetCategory = 'property' | 'vehicle' | 'equipment' | 'investment' | 'collectible' | 'other';
export type AssetStatus = 'active' | 'pledged';

export interface Asset {
  id: string;
  folio: string;
  name: string;
  category: AssetCategory;
  description: string;
  location: string;
  acquiredOn: string;
  declaredValue: number;
  status: AssetStatus;
}

export type DocumentKind = 'ownership' | 'insurance' | 'identity' | 'tax' | 'contract' | 'invoice' | 'other';

export interface VaultDocument {
  id: string;
  title: string;
  kind: DocumentKind;
  assetId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  addedOn: string;
  expiresOn: string | null;
  /** User-declared: this file is the certified or original copy. Not a verification result. */
  certifiedCopy: boolean;
  version: number;
  /** Set only for files picked on this device during the preview. */
  localUri?: string;
}

export type AccessLevel = 'view' | 'download';

export interface Share {
  id: string;
  documentId: string;
  recipientName: string;
  recipientEmail: string;
  access: AccessLevel;
  createdOn: string;
  expiresOn: string | null;
  revokedOn: string | null;
  views: number;
  lastAccessedOn: string | null;
  note?: string;
}

export type ShareState = 'active' | 'expired' | 'revoked';

export type ActivityKind = 'registered' | 'uploaded' | 'shared' | 'viewed' | 'downloaded' | 'updated' | 'revoked' | 'expired';

export interface ActivityEvent {
  id: string;
  at: string;
  kind: ActivityKind;
  actor: string;
  summary: string;
  assetId?: string;
  documentId?: string;
  shareId?: string;
}

export interface VaultSnapshot {
  assets: Asset[];
  documents: VaultDocument[];
  shares: Share[];
  activity: ActivityEvent[];
}

export interface UserProfile {
  name: string;
  firstName: string;
  email: string;
  memberSince: string;
}

export type NewAsset = Omit<Asset, 'id' | 'folio'>;
export type NewDocument = Omit<VaultDocument, 'id' | 'addedOn' | 'version'>;
export interface NewShare {
  documentId: string;
  recipientName: string;
  recipientEmail: string;
  access: AccessLevel;
  expiresOn: string | null;
  note?: string;
}
export interface SharePatch {
  access?: AccessLevel;
  expiresOn?: string | null;
}
