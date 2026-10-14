/**
 * MOCK implementation of VaultRepository. State lives in memory and resets when the app restarts.
 * `mockControls` exists only for the "Preview tools" section of the profile screen.
 */
import type { ActivityEvent, VaultSnapshot } from '@/domain/types';
import { RepositoryError, type Mutation, type VaultRepository } from '@/services/vaultRepository';
import { nowIso } from '@/utils/date';
import { emptySnapshot, seedSnapshot } from './fixtures';

export type PreviewDataMode = 'normal' | 'empty' | 'error';

let mode: PreviewDataMode = 'normal';
let db: VaultSnapshot = seedSnapshot();
let counter = 100;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const nextId = (p: string) => `${p}${++counter}`;

function assertWritable() {
  if (mode === 'error') throw new RepositoryError('Couldn’t save your changes. Check your connection and try again.');
}

function log(e: Omit<ActivityEvent, 'id' | 'at'>) {
  db.activity.unshift({ id: nextId('e'), at: nowIso(), ...e });
}

const done = <T,>(result: T): Mutation<T> => ({ snapshot: clone(db), result });

export const mockControls = {
  setMode(next: PreviewDataMode) {
    const wasEmpty = mode === 'empty';
    mode = next;
    if (next === 'empty') db = emptySnapshot();
    else if (wasEmpty) db = seedSnapshot();
  },
  reset() {
    db = mode === 'empty' ? emptySnapshot() : seedSnapshot();
  },
};

export const mockVaultRepository: VaultRepository = {
  async load() {
    await wait(750);
    if (mode === 'error') throw new RepositoryError('Couldn’t load your vault. Check your connection and try again.');
    return clone(db);
  },

  async registerAsset(input) {
    await wait(600);
    assertWritable();
    const max = Math.max(400, ...db.assets.map((a) => parseInt(a.folio.slice(3), 10) || 0));
    const asset = { ...clone(input), id: nextId('a'), folio: `AV-${String(max + 1).padStart(4, '0')}` };
    db.assets.unshift(asset);
    log({ kind: 'registered', actor: 'You', summary: `You registered ${asset.name}`, assetId: asset.id });
    return done(asset);
  },

  async addDocument(input) {
    await wait(700);
    assertWritable();
    const document = { ...clone(input), id: nextId('d'), addedOn: nowIso(), version: 1 };
    db.documents.unshift(document);
    log({ kind: 'uploaded', actor: 'You', summary: `You added ${document.title}`, documentId: document.id, assetId: document.assetId ?? undefined });
    return done(document);
  },

  async deleteDocument(id) {
    await wait(700);
    assertWritable();

    const index = db.documents.findIndex(
      (document) => document.id === id
    );

    if (index === -1) {
      throw new Error('Document not found.');
    }

    db.documents.splice(index, 1);
  },

  async createShare(input) {
    await wait(650);
    assertWritable();
    const doc = db.documents.find((d) => d.id === input.documentId);
    if (!doc) throw new RepositoryError('That document no longer exists.');
    const share = { ...clone(input), id: nextId('s'), createdOn: nowIso(), revokedOn: null, views: 0, lastAccessedOn: null };
    db.shares.unshift(share);
    log({ kind: 'shared', actor: 'You', summary: `You shared ${doc.title} with ${share.recipientName}`, documentId: doc.id, shareId: share.id });
    return done(share);
  },

  async updateShare(id, patch) {
    await wait(450);
    assertWritable();
    const share = db.shares.find((s) => s.id === id);
    if (!share) throw new RepositoryError('That share no longer exists.');
    if (patch.access !== undefined) share.access = patch.access;
    if (patch.expiresOn !== undefined) share.expiresOn = patch.expiresOn;
    const doc = db.documents.find((d) => d.id === share.documentId);
    log({ kind: 'updated', actor: 'You', summary: `You changed ${share.recipientName}’s access to ${doc?.title ?? 'a document'}`, documentId: share.documentId, shareId: id });
    return done(clone(share));
  },

  async revokeShare(id) {
    await wait(700);
    assertWritable();
    const share = db.shares.find((s) => s.id === id);
    if (!share) throw new RepositoryError('That share no longer exists.');
    share.revokedOn = nowIso();
    const doc = db.documents.find((d) => d.id === share.documentId);
    log({ kind: 'revoked', actor: 'You', summary: `You revoked ${share.recipientName}’s access to ${doc?.title ?? 'a document'}`, documentId: share.documentId, shareId: id });
    return done(clone(share));
  },
};
