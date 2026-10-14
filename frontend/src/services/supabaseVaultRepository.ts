import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import type {
  ActivityEvent,
  Asset,
  NewAsset,
  NewDocument,
  NewShare,
  Share,
  SharePatch,
  VaultDocument,
  VaultSnapshot,
} from '@/domain/types';
import { RepositoryError, type Mutation, type VaultRepository } from './vaultRepository';

const fail = (error: { message: string } | null): void => {
  if (error) throw new RepositoryError(error.message);
};

const iso = () => new Date().toISOString();

function mapAsset(row: any): Asset {
  return {
    id: row.id,
    folio: row.folio ?? '',
    name: row.asset_name,
    category: row.category,
    description: row.notes ?? '',
    location: row.location_or_registration ?? '',
    acquiredOn: row.acquired_on ?? '',
    declaredValue: Number(row.declared_value ?? 0),
    status: row.status === 'pledged_as_security' ? 'pledged' : 'active',
  };
}

function mapDocument(row: any): VaultDocument {
  const path = row.storage_path ?? '';
  return {
    id: row.id,
    title: row.name,
    kind: row.kind ?? 'other',
    assetId: row.asset_id,
    fileName: row.file_name ?? path.split('/').pop() ?? row.name,
    mimeType: row.mime_type ?? 'application/octet-stream',
    sizeBytes: Number(row.size_bytes ?? 0),
    addedOn: row.created_at,
    expiresOn: row.expires_on,
    certifiedCopy: Boolean(row.certified_copy),
    version: 1,
  };
}

function mapShare(row: any): Share {
  return {
    id: row.id,
    documentId: row.document_id,
    recipientName: row.recipient_name ?? '',
    recipientEmail: row.recipient_email,
    access: row.permission,
    createdOn: row.created_at,
    expiresOn: row.expires_at,
    revokedOn: row.revoked_at,
    views: 0,
    lastAccessedOn: null,
  };
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new RepositoryError(error.message);
  if (!data.user) throw new RepositoryError('Please sign in to access your vault.');
  return data.user;
}

async function snapshot(): Promise<VaultSnapshot> {
  const user = await requireUser();

  const [assetsResult, docsResult, sharesResult, eventsResult] = await Promise.all([
    supabase.from('assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('document_shares').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('access_events').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(100),
  ]);

  fail(assetsResult.error);
  fail(docsResult.error);
  fail(sharesResult.error);
  fail(eventsResult.error);

  const assets = (assetsResult.data ?? []).map(mapAsset);
  const documents = (docsResult.data ?? []).map(mapDocument);
  const shares = (sharesResult.data ?? []).map(mapShare);

  const assetNames = new Map(assets.map((a) => [a.id, a.name]));
  const docNames = new Map(documents.map((d) => [d.id, d.title]));

  const activity: ActivityEvent[] = (eventsResult.data ?? []).map((e: any) => ({
    id: e.id,
    at: e.created_at,
    kind: e.event_type === 'granted' ? 'shared'
      : e.event_type === 'viewed' ? 'viewed'
      : e.event_type === 'downloaded' ? 'downloaded'
      : e.event_type === 'revoked' ? 'revoked'
      : e.event_type === 'expired' ? 'expired'
      : 'updated',
    actor: e.actor_id === user.id ? 'You' : 'Recipient',
    summary: `${e.event_type.replaceAll('_', ' ')}${e.document_id ? `: ${docNames.get(e.document_id) ?? 'document'}` : ''}`,
    assetId: undefined,
    documentId: e.document_id ?? undefined,
    shareId: e.share_id ?? undefined,
  }));

  return { assets, documents, shares, activity };
}

export const supabaseVaultRepository: VaultRepository = {
  async load() {
    return snapshot();
  },

  async registerAsset(input: NewAsset): Promise<Mutation<Asset>> {
    const user = await requireUser();
    const { data, error } = await supabase.from('assets').insert({
      user_id: user.id,
      asset_name: input.name,
      category: input.category,
      notes: input.description,
      location_or_registration: input.location,
      acquired_on: input.acquiredOn || null,
      declared_value: input.declaredValue,
      status: input.status === 'pledged' ? 'pledged_as_security' : 'active',
    }).select('*').single();

    fail(error);
    if (!data) throw new RepositoryError('Asset was not returned after saving.');
    return { snapshot: await snapshot(), result: mapAsset(data) };
  },

  
  async addDocument(input: NewDocument): Promise<Mutation<VaultDocument>> {
    const user = await requireUser();

    if (!input.localUri) {
      throw new RepositoryError('No local file was selected.');
    }

    const fileName = input.fileName?.trim() || input.title?.trim() || 'document';
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${Date.now()}-${safeName}`;

    let fileBytes: ArrayBuffer;

if (Platform.OS === 'web') {
  const response = await fetch(input.localUri);
  const blob = await response.blob();
  fileBytes = await blob.arrayBuffer();
} else {
  const base64 = await FileSystem.readAsStringAsync(input.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  fileBytes = decode(base64);
}

    if (fileBytes.byteLength > 25 * 1024 * 1024) {
      throw new RepositoryError('The document must be 25 MB or smaller.');
    }

    const mimeType = input.mimeType || 'application/octet-stream';

    if (
      ![
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
      ].includes(mimeType)
    ) {
      throw new RepositoryError('Only PDF, JPEG, PNG, and WebP files are supported.');
    }

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBytes, {
        contentType: mimeType,
        upsert: false,
      });

    fail(uploadError);

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          owner_id: user.id,
          asset_id: input.assetId,
          name: input.title || fileName,
          file_name: fileName,
          kind: input.kind || 'other',
          mime_type: mimeType,
          size_bytes: fileBytes.byteLength,
          storage_path: storagePath,
          expires_on: input.expiresOn || null,
          certified_copy: Boolean(input.certifiedCopy),
        })
        .select('*')
        .single();

      fail(error);

      if (!data) {
        throw new RepositoryError('Document metadata was not returned after saving.');
      }

      return {
        snapshot: await snapshot(),
        result: mapDocument(data),
      };
    } catch (error) {
      const { error: cleanupError } = await supabase.storage
        .from('documents')
        .remove([storagePath]);

      if (cleanupError) {
        console.error('Could not remove uploaded file after metadata failure:', cleanupError);
      }

      throw error;
    }
  },

async deleteDocument(id: string): Promise<void> {
  const user = await requireUser();

  // Find this user's document and its Storage path.
  const { data: doc, error: findError } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (findError || !doc) {
    throw new RepositoryError(
      findError?.message ?? 'Document not found or access denied.'
    );
  }

  // Delete the database record first.
  const { data: deleted, error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id')
    .maybeSingle();

  if (deleteError) {
    throw new RepositoryError(
      `Could not delete document record: ${deleteError.message}`
    );
  }

  if (!deleted) {
    throw new RepositoryError(
      'Document was not deleted. Check your database permissions.'
    );
  }

  // Remove the actual file from private Storage.
  if (doc.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.storage_path]);

    if (storageError) {
      console.error('Storage cleanup failed:', storageError.message);
      throw new RepositoryError(
        'The document record was deleted, but its stored file could not be removed. Please check Storage permissions.'
      );
    }
  }
},


  async createShare(input: NewShare): Promise<Mutation<Share>> {
    await requireUser();
    const { data, error } = await supabase.rpc('grant_access', {
      p_document_id: input.documentId,
      p_recipient_email: input.recipientEmail,
      p_permission: input.access,
      p_expires_at: input.expiresOn,
      p_recipient_name: input.recipientName || null,
    });

    fail(error);
    if (!data) throw new RepositoryError('Share was not returned after saving.');
    return { snapshot: await snapshot(), result: mapShare(data) };
  },

  async updateShare(id: string, patch: SharePatch): Promise<Mutation<Share>> {
    await requireUser();
    let result: any = null;

    if (patch.access !== undefined) {
      const { data, error } = await supabase.rpc('change_access_permission', {
        p_share_id: id,
        p_permission: patch.access,
      });
      fail(error);
      result = data;
    }

    if (patch.expiresOn !== undefined) {
      const { data, error } = await supabase.rpc('extend_access', {
        p_share_id: id,
        p_new_expires_at: patch.expiresOn,
      });
      fail(error);
      result = data;
    }

    if (!result) {
      const { data, error } = await supabase.from('document_shares')
        .select('*').eq('id', id).single();
      fail(error);
      result = data;
    }

    return { snapshot: await snapshot(), result: mapShare(result) };
  },

  async revokeShare(id: string): Promise<Mutation<Share>> {
    await requireUser();
    const { data, error } = await supabase.rpc('revoke_access', {
      p_share_id: id,
    });

    fail(error);
    if (!data) throw new RepositoryError('Share was not returned after revoking access.');
    return { snapshot: await snapshot(), result: mapShare(data) };
  },
};
