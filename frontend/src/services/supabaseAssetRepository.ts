
import { supabase } from '@/lib/supabase';
import type { Asset, NewAsset } from '@/domain/types';

type AssetRow = {
  id: string;
  user_id: string;
  asset_name: string;
  category: Asset['category'];
  location_or_registration: string | null;
  acquired_on: string | null;
  declared_value: number | string;
  status: 'active' | 'pledged_as_security';
  notes: string | null;
  created_at: string;
};

function mapAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    // The current assets schema doesn't expose a folio column.
    // Generate a stable display reference from the database UUID.
    folio: `AV-${row.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
    name: row.asset_name,
    category: row.category,
    description: row.notes ?? '',
    location: row.location_or_registration ?? '',
    acquiredOn: row.acquired_on ?? '',
    declaredValue: Number(row.declared_value),
    status: row.status === 'pledged_as_security' ? 'pledged' : 'active',
  };
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Please sign in to access your assets.');
  }

  return data.user.id;
}

export const supabaseAssetRepository = {
  async load(): Promise<Asset[]> {
    await requireUserId();

    const { data, error } = await supabase
      .from('assets')
      .select(
        'id, user_id, asset_name, category, location_or_registration, acquired_on, declared_value, status, notes, created_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Could not load assets: ${error.message}`);
    }

    return (data ?? []).map((row) => mapAsset(row as AssetRow));
  },

  async register(input: NewAsset): Promise<Asset> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        asset_name: input.name.trim(),
        category: input.category,
        location_or_registration: input.location.trim() || null,
        acquired_on: input.acquiredOn || null,
        declared_value: input.declaredValue,
        status:
          input.status === 'pledged'
            ? 'pledged_as_security'
            : 'active',
        notes: input.description.trim() || null,
      })
      .select(
        'id, user_id, asset_name, category, location_or_registration, acquired_on, declared_value, status, notes, created_at',
      )
      .single();

    if (error) {
      throw new Error(`Could not register asset: ${error.message}`);
    }

    return mapAsset(data as AssetRow);
  },
};
