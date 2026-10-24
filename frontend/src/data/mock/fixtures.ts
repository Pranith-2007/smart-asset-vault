/**
 * MOCK DATA ONLY. Everything here is fictional.
 * Dates are relative to "now" so the sample stays coherent whenever the app is opened.
 * Nothing in this folder should be imported by screens; screens talk to `@/services`.
 */
import type { ActivityEvent, Asset, Share, UserProfile, VaultDocument, VaultSnapshot } from '@/domain/types';
import { daysAgo, daysAhead, hoursAgo } from '@/utils/date';

export const mockUser: UserProfile = {
  name: 'Anika Rao',
  firstName: 'Anika',
  email: 'anika.rao@example.com',
  memberSince: daysAgo(540),
};

const assets: Asset[] = [
  { id: 'a1', folio: 'AV-0412', name: 'Harbour View, Flat 4B', category: 'property', status: 'active',
    location: 'Harbour View Residences, Tower C', acquiredOn: daysAgo(2900), declaredValue: 18_400_000,
    description: 'Two-bedroom freehold apartment with parking bay 14.' },
  { id: 'a2', folio: 'AV-0388', name: 'Survey 118/2 land parcel', category: 'property', status: 'active',
    location: 'Marlow Taluk, 0.8 acre', acquiredOn: daysAgo(4100), declaredValue: 6_200_000,
    description: 'Inherited agricultural land, boundary stones re-marked at the last survey.' },
  { id: 'a3', folio: 'AV-0431', name: 'Family sedan, 2021', category: 'vehicle', status: 'active',
    location: 'Registration KA 05 MX 4821', acquiredOn: daysAgo(1900), declaredValue: 780_000,
    description: 'Petrol sedan, single owner, serviced at the authorised centre.' },
  { id: 'a4', folio: 'AV-0447', name: 'Delivery van, 2019', category: 'vehicle', status: 'pledged',
    location: 'Registration KA 01 AB 7730', acquiredOn: daysAgo(2600), declaredValue: 550_000,
    description: 'Hypothecated to Northfield Credit until the loan is closed.' },
  { id: 'a5', folio: 'AV-0452', name: 'Studio camera kit', category: 'equipment', status: 'active',
    location: 'Studio cabinet 2', acquiredOn: daysAgo(900), declaredValue: 425_000,
    description: 'Body, three lenses, two flashes and a lighting stand set.' },
  { id: 'a6', folio: 'AV-0459', name: 'Laser engraver LX-40', category: 'equipment', status: 'active',
    location: 'Workshop floor', acquiredOn: daysAgo(620), declaredValue: 310_000,
    description: '40 W desktop engraver with extraction unit.' },
  { id: 'a7', folio: 'AV-0466', name: 'Heirloom pocket watch', category: 'collectible', status: 'active',
    location: 'Bank locker 118', acquiredOn: daysAgo(6200), declaredValue: 240_000,
    description: 'Silver case, hand-wound movement, passed down from a grandparent.' },
  { id: 'a8', folio: 'AV-0471', name: 'Gold holdings', category: 'investment', status: 'active',
    location: 'Bank locker 118', acquiredOn: daysAgo(1400), declaredValue: 780_000,
    description: '40 g in four 10 g bars, purchased in two lots.' },
];

const doc = (d: Partial<VaultDocument> & Pick<VaultDocument, 'id' | 'title' | 'kind' | 'fileName' | 'sizeBytes' | 'addedOn'>): VaultDocument => ({
  assetId: null, mimeType: 'application/pdf', expiresOn: null, certifiedCopy: false, version: 1, ...d,
});

const documents: VaultDocument[] = [
  doc({ id: 'd1', title: 'Sale deed, Flat 4B', kind: 'ownership', assetId: 'a1', fileName: 'sale-deed-4b.pdf', sizeBytes: 2_516_582, addedOn: daysAgo(400), certifiedCopy: true }),
  doc({ id: 'd2', title: 'Property tax receipt', kind: 'tax', assetId: 'a1', fileName: 'property-tax-receipt.pdf', sizeBytes: 318_000, addedOn: daysAgo(120) }),
  doc({ id: 'd3', title: 'Home insurance policy', kind: 'insurance', assetId: 'a1', fileName: 'home-policy.pdf', sizeBytes: 1_153_434, addedOn: daysAgo(330), expiresOn: daysAhead(38), version: 2 }),
  doc({ id: 'd4', title: 'Society share certificate', kind: 'ownership', assetId: 'a1', fileName: 'share-certificate.pdf', sizeBytes: 402_000, addedOn: daysAgo(398), certifiedCopy: true }),
  doc({ id: 'd5', title: 'Land title record', kind: 'ownership', assetId: 'a2', fileName: 'title-record-118-2.pdf', sizeBytes: 3_250_585, addedOn: daysAgo(380), certifiedCopy: true }),
  doc({ id: 'd6', title: 'Land survey sketch', kind: 'other', assetId: 'a2', fileName: 'survey-sketch.jpg', mimeType: 'image/jpeg', sizeBytes: 4_404_019, addedOn: daysAgo(300) }),
  doc({ id: 'd7', title: 'Vehicle registration certificate', kind: 'ownership', assetId: 'a3', fileName: 'rc-sedan.pdf', sizeBytes: 640_000, addedOn: daysAgo(210), certifiedCopy: true }),
  doc({ id: 'd8', title: 'Motor insurance, sedan', kind: 'insurance', assetId: 'a3', fileName: 'motor-policy.pdf', sizeBytes: 905_000, addedOn: daysAgo(377), expiresOn: daysAgo(12) }),
  doc({ id: 'd9', title: 'Loan agreement, delivery van', kind: 'contract', assetId: 'a4', fileName: 'van-loan-agreement.pdf', sizeBytes: 1_887_436, addedOn: daysAgo(205) }),
  doc({ id: 'd10', title: 'Van registration certificate', kind: 'ownership', assetId: 'a4', fileName: 'rc-van.pdf', sizeBytes: 590_000, addedOn: daysAgo(204), certifiedCopy: true }),
  doc({ id: 'd11', title: 'Camera kit invoice', kind: 'invoice', assetId: 'a5', fileName: 'camera-invoice.pdf', sizeBytes: 275_000, addedOn: daysAgo(890) }),
  doc({ id: 'd12', title: 'Engraver warranty card', kind: 'contract', assetId: 'a6', fileName: 'engraver-warranty.pdf', sizeBytes: 220_000, addedOn: daysAgo(610), expiresOn: daysAhead(200) }),
  doc({ id: 'd13', title: 'Engraver purchase invoice', kind: 'invoice', assetId: 'a6', fileName: 'engraver-invoice.pdf', sizeBytes: 301_000, addedOn: daysAgo(610) }),
  doc({ id: 'd14', title: 'Watch appraisal report', kind: 'other', assetId: 'a7', fileName: 'watch-appraisal.pdf', sizeBytes: 1_048_576, addedOn: daysAgo(35), certifiedCopy: true }),
  doc({ id: 'd15', title: 'Gold purchase receipts', kind: 'invoice', assetId: 'a8', fileName: 'gold-receipts.pdf', sizeBytes: 512_000, addedOn: daysAgo(1380) }),
  doc({ id: 'd16', title: 'Passport copy', kind: 'identity', fileName: 'passport.pdf', sizeBytes: 780_000, addedOn: daysAgo(500), expiresOn: daysAhead(900), certifiedCopy: true }),
  doc({ id: 'd17', title: 'Tax return, last assessment year', kind: 'tax', fileName: 'tax-return.pdf', sizeBytes: 1_310_720, addedOn: daysAgo(22) }),
];

const shares: Share[] = [
  { id: 's1', documentId: 'd3', recipientName: 'Priya Menon', recipientEmail: 'priya.menon@example.com', access: 'download',
    createdOn: daysAgo(20), expiresOn: daysAhead(10), revokedOn: null, views: 4, lastAccessedOn: hoursAgo(50), note: 'For the renewal quote.' },
  { id: 's2', documentId: 'd1', recipientName: 'Rao & Iyer Advocates', recipientEmail: 'office@raoiyer.example', access: 'view',
    createdOn: daysAgo(45), expiresOn: null, revokedOn: null, views: 3, lastAccessedOn: daysAgo(40) },
  { id: 's3', documentId: 'd5', recipientName: 'Arjun Shetty', recipientEmail: 'arjun.shetty@example.com', access: 'view',
    createdOn: daysAgo(100), expiresOn: daysAhead(20), revokedOn: null, views: 2, lastAccessedOn: daysAgo(60) },
  { id: 's4', documentId: 'd9', recipientName: 'Northfield Credit', recipientEmail: 'loans@northfield.example', access: 'download',
    createdOn: daysAgo(200), expiresOn: daysAgo(30), revokedOn: null, views: 6, lastAccessedOn: daysAgo(45) },
  { id: 's5', documentId: 'd7', recipientName: 'Kavya Nair', recipientEmail: 'kavya.nair@example.com', access: 'view',
    createdOn: daysAgo(15), expiresOn: daysAhead(15), revokedOn: daysAgo(3), views: 1, lastAccessedOn: daysAgo(14) },
  { id: 's6', documentId: 'd11', recipientName: 'Studio Mutual Insurance', recipientEmail: 'claims@studiomutual.example', access: 'view',
    createdOn: daysAgo(8), expiresOn: daysAhead(6), revokedOn: null, views: 1, lastAccessedOn: hoursAgo(30) },
];

const activity: ActivityEvent[] = [
  { id: 'e1', at: hoursAgo(30), kind: 'viewed', actor: 'Studio Mutual Insurance', summary: 'Studio Mutual Insurance viewed Camera kit invoice', documentId: 'd11', shareId: 's6' },
  { id: 'e2', at: hoursAgo(50), kind: 'downloaded', actor: 'Priya Menon', summary: 'Priya Menon downloaded Home insurance policy', documentId: 'd3', shareId: 's1' },
  { id: 'e3', at: daysAgo(3), kind: 'revoked', actor: 'You', summary: 'You revoked Kavya Nair’s access to Vehicle registration certificate', documentId: 'd7', shareId: 's5' },
  { id: 'e4', at: daysAgo(8), kind: 'shared', actor: 'You', summary: 'You shared Camera kit invoice with Studio Mutual Insurance', documentId: 'd11', shareId: 's6' },
  { id: 'e5', at: daysAgo(14), kind: 'viewed', actor: 'Kavya Nair', summary: 'Kavya Nair viewed Vehicle registration certificate', documentId: 'd7', shareId: 's5' },
  { id: 'e6', at: daysAgo(15), kind: 'shared', actor: 'You', summary: 'You shared Vehicle registration certificate with Kavya Nair', documentId: 'd7', shareId: 's5' },
  { id: 'e7', at: daysAgo(20), kind: 'shared', actor: 'You', summary: 'You shared Home insurance policy with Priya Menon', documentId: 'd3', shareId: 's1' },
  { id: 'e8', at: daysAgo(22), kind: 'uploaded', actor: 'You', summary: 'You added Tax return, last assessment year', documentId: 'd17' },
  { id: 'e9', at: daysAgo(30), kind: 'expired', actor: 'System', summary: 'Northfield Credit’s access to Loan agreement, delivery van expired', documentId: 'd9', shareId: 's4' },
  { id: 'e10', at: daysAgo(35), kind: 'uploaded', actor: 'You', summary: 'You added Watch appraisal report', documentId: 'd14', assetId: 'a7' },
  { id: 'e11', at: daysAgo(40), kind: 'viewed', actor: 'Rao & Iyer Advocates', summary: 'Rao & Iyer Advocates viewed Sale deed, Flat 4B', documentId: 'd1', shareId: 's2' },
  { id: 'e12', at: daysAgo(45), kind: 'shared', actor: 'You', summary: 'You shared Sale deed, Flat 4B with Rao & Iyer Advocates', documentId: 'd1', shareId: 's2' },
  { id: 'e13', at: daysAgo(60), kind: 'viewed', actor: 'Arjun Shetty', summary: 'Arjun Shetty viewed Land title record', documentId: 'd5', shareId: 's3' },
  { id: 'e14', at: daysAgo(100), kind: 'shared', actor: 'You', summary: 'You shared Land title record with Arjun Shetty', documentId: 'd5', shareId: 's3' },
  { id: 'e15', at: daysAgo(200), kind: 'shared', actor: 'You', summary: 'You shared Loan agreement, delivery van with Northfield Credit', documentId: 'd9', shareId: 's4' },
];

// Deep copy every time, so writes to the working database can never alter the fixtures.
export const seedSnapshot = (): VaultSnapshot =>
  JSON.parse(
    JSON.stringify({
      assets,
      documents,
      shares,
      receivedShares: [],
      activity,
    }),
  );

export const emptySnapshot = (): VaultSnapshot => ({
  assets: [],
  documents: [],
  shares: [],
  receivedShares: [],
  activity: [],
});