import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText, Button, Chips, EmptyState, Entry, ErrorState, HeaderIconButton, Screen, ScreenHeader, SearchField, Segmented, SkeletonRows, Tag, useToast,
} from '@/components';
import { featuredDocuments, featuredTypes, parseFeatured, type FeaturedKey } from '@/domain/featured';
import { categoryMeta, kindMeta } from '@/domain/labels';
import { isActiveShare } from '@/domain/selectors';
import type { AssetCategory, DocumentKind } from '@/domain/types';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { daysUntil } from '@/utils/date';
import { expiryLabel, formatBytes, formatINRCompact, plural } from '@/utils/format';

type View_ = 'documents' | 'assets';

/**
 * All Documents: the one place for the complete collection.
 * It replaces the old Vault and Assets tabs and keeps all of their features:
 * search, filters, add document, register asset, pull to refresh, and every state.
 */
export default function AllDocuments() {
  const router = useRouter();
  const toast = useToast();
  const vault = useVault();
  const params = useLocalSearchParams<{ view?: string; filter?: string }>();
  const [view, setView] = useState<View_>(params.view === 'assets' ? 'assets' : 'documents');
  const [featured, setFeatured] = useState<FeaturedKey | null>(parseFeatured(params.filter));
  const [refreshing, setRefreshing] = useState(false);

  // Opening this tab again with new parameters (for example from a home card) updates the screen.
  useEffect(() => {
    if (params.view === 'assets') setView('assets');
    else if (params.view === 'documents') setView('documents');
    const f = parseFeatured(params.filter);
    if (f) { setFeatured(f); setView('documents'); }
  }, [params.view, params.filter]);

  const header = (
    <ScreenHeader
      title="All Documents"
      subtitle={vault.status === 'ready' ? `${plural(vault.documents.length, 'document')} and ${plural(vault.assets.length, 'asset')}` : undefined}
      right={
        view === 'documents'
          ? <HeaderIconButton icon="upload" label="Add a document" onPress={() => router.push('/document/upload')} />
          : <HeaderIconButton icon="plus" label="Register an asset" onPress={() => router.push('/asset/new')} />
      }
    />
  );

  if (vault.status === 'idle' || vault.status === 'loading') return <Screen header={header} padBottom={false}><SkeletonRows count={6} /></Screen>;
  if (vault.status === 'error') return <Screen header={header} padBottom={false}><ErrorState body={vault.error ?? ''} onRetry={vault.reload} /></Screen>;

  const onRefresh = async () => {
    setRefreshing(true);
    const ok = await vault.refresh();
    setRefreshing(false);
    if (!ok) toast.show('Couldn’t refresh. Try again.', 'error');
  };
  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.patina]} progressBackgroundColor={colors.folio} />;

  const switcher = (
    <View style={{ paddingHorizontal: space.xl, paddingBottom: space.md }}>
      <Segmented
        value={view}
        onChange={(v) => { setView(v); if (v === 'assets') setFeatured(null); }}
        options={[{ value: 'documents', label: `Documents (${vault.documents.length})` }, { value: 'assets', label: `Assets (${vault.assets.length})` }]}
      />
    </View>
  );

  return (
    <Screen header={header} scroll={false} padBottom={false}>
      {view === 'documents'
        ? <DocumentsList top={switcher} refreshControl={refreshControl} featured={featured} onClearFeatured={() => setFeatured(null)} />
        : <AssetsList top={switcher} refreshControl={refreshControl} />}
    </Screen>
  );
}

function DocumentsList({ top, refreshControl, featured, onClearFeatured }: { top: React.ReactElement; refreshControl: React.ReactElement<React.ComponentProps<typeof RefreshControl>>; featured: FeaturedKey | null; onClearFeatured: () => void }) {
  const router = useRouter();
  const vault = useVault();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | DocumentKind>('all');

  const kinds = useMemo(() => Array.from(new Set(vault.documents.map((d) => d.kind))), [vault.documents]);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = featured ? featuredDocuments(featured, vault) : vault.documents;
    return pool.filter((d) => (kind === 'all' || d.kind === kind) && (!q || d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)));
  }, [vault, featured, query, kind]);
  const featuredTitle = featuredTypes.find((t) => t.key === featured)?.title;

  return (
    <FlatList
      data={items}
      keyExtractor={(d) => d.id}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={{ paddingBottom: space.x3 }}
      ListHeaderComponent={
        <View style={styles.filters}>
          {top}
          {vault.documents.length > 0 ? (
            <>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search documents" />
              {featuredTitle ? (
                <View style={styles.showing}>
                  <AppText style={{ flex: 1, fontSize: 16 }}>{`Showing: ${featuredTitle}`}</AppText>
                  <Button title="Show all" variant="quiet" compact onPress={onClearFeatured} />
                </View>
              ) : null}
              <Chips value={kind} onChange={setKind} options={[{ value: 'all', label: 'All' }, ...kinds.map((k) => ({ value: k, label: kindMeta[k].plural }))]} />
            </>
          ) : null}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.rule }} />
        </View>
      }
      ListEmptyComponent={
        vault.documents.length === 0
          ? <EmptyState icon="folder" title="No documents yet" body="Add deeds, policies, invoices and identity papers. You can link each one to an asset and decide who may see it." action={{ label: 'Add a document', icon: 'upload', onPress: () => router.push('/document/upload') }} />
          : <EmptyState icon="search" title="No matching documents" body="Try a different title, or choose another type." action={{ label: 'Clear filters', onPress: () => { setQuery(''); setKind('all'); onClearFeatured(); } }} />
      }
      renderItem={({ item: d }) => {
        const asset = vault.assets.find((a) => a.id === d.assetId);
        const sharedWith = vault.shares.filter((s) => s.documentId === d.id && isActiveShare(s)).length;
        const left = d.expiresOn ? daysUntil(d.expiresOn) : null;
        return (
          <Entry
            icon={kindMeta[d.kind].icon}
            title={d.title}
            subtitle={asset ? asset.name : 'Not linked to an asset'}
            metaSub={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {left !== null && left < 0 ? <Tag label="Expired" tone="bad" /> : left !== null && left <= 60 ? <Tag label={expiryLabel(d.expiresOn).replace('Expires ', '')} tone="warn" icon="clock" /> : null}
                {d.certifiedCopy ? <Tag label="Certified copy" tone="seal" icon="award" /> : null}
                {left === null || left > 60 ? <AppText variant="caption" tone="muted">{sharedWith ? `Shared with ${sharedWith}` : `Private, ${formatBytes(d.sizeBytes)}`}</AppText> : null}
              </View>
            }
            onPress={() => router.push(`/document/${d.id}`)}
          />
        );
      }}
    />
  );
}

function AssetsList({ top, refreshControl }: { top: React.ReactElement; refreshControl: React.ReactElement<React.ComponentProps<typeof RefreshControl>> }) {
  const router = useRouter();
  const vault = useVault();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | AssetCategory>('all');

  const categories = useMemo(() => Array.from(new Set(vault.assets.map((a) => a.category))), [vault.assets]);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vault.assets.filter((a) => (category === 'all' || a.category === category) && (!q || a.name.toLowerCase().includes(q) || a.folio.toLowerCase().includes(q)));
  }, [vault.assets, query, category]);

  return (
    <FlatList
      data={items}
      keyExtractor={(a) => a.id}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={{ paddingBottom: space.x3 }}
      ListHeaderComponent={
        <View style={styles.filters}>
          {top}
          {vault.assets.length > 0 ? (
            <>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search by name or folio" />
              <Chips value={category} onChange={setCategory} options={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: categoryMeta[c].plural }))]} />
            </>
          ) : null}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.rule }} />
        </View>
      }
      ListEmptyComponent={
        vault.assets.length === 0
          ? <EmptyState icon="layers" title="No assets registered" body="Register a property, vehicle or valuable to keep its details and documents together." action={{ label: 'Register an asset', icon: 'plus', onPress: () => router.push('/asset/new') }} />
          : <EmptyState icon="search" title="No matching assets" body="Try a different name or folio number, or choose another category." action={{ label: 'Clear filters', onPress: () => { setQuery(''); setCategory('all'); } }} />
      }
      renderItem={({ item: a }) => {
        const docs = vault.documents.filter((d) => d.assetId === a.id).length;
        return (
          <Entry
            icon={categoryMeta[a.category].icon}
            title={a.name}
            subtitle={`${a.folio}, ${categoryMeta[a.category].label}`}
            meta={formatINRCompact(a.declaredValue)}
            metaSub={a.status === 'pledged' ? <Tag label="Pledged" tone="warn" /> : <AppText variant="caption" tone="muted">{plural(docs, 'document')}</AppText>}
            onPress={() => router.push(`/asset/${a.id}`)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  filters: { gap: space.md, paddingBottom: space.md },
  showing: { flexDirection: 'row', alignItems: 'center', marginHorizontal: space.xl, paddingLeft: space.lg, paddingRight: space.xs, borderRadius: 10, backgroundColor: colors.patinaTint },
});
