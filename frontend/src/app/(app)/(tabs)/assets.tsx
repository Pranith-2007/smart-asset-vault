import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppText, Chips, EmptyState, Entry, ErrorState, HeaderIconButton, Screen, ScreenHeader, SearchField, SkeletonRows, Tag, useToast,
} from '@/components';
import { categoryMeta } from '@/domain/labels';
import { totalDeclaredValue } from '@/domain/selectors';
import type { AssetCategory } from '@/domain/types';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { formatINRCompact, plural } from '@/utils/format';

export default function Assets() {
  const router = useRouter();
  const toast = useToast();
  const vault = useVault();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | AssetCategory>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => Array.from(new Set(vault.assets.map((a) => a.category))), [vault.assets]);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vault.assets.filter(
      (a) => (category === 'all' || a.category === category) && (!q || a.name.toLowerCase().includes(q) || a.folio.toLowerCase().includes(q)),
    );
  }, [vault.assets, query, category]);

  const header = (
    <ScreenHeader
      title="Assets"
      subtitle={vault.status === 'ready' && vault.assets.length ? `${plural(vault.assets.length, 'asset')} on record, ${formatINRCompact(totalDeclaredValue(vault))} declared` : undefined}
      right={<HeaderIconButton icon="plus" label="Register an asset" onPress={() => router.push('/asset/new')} />}
    />
  );

  if (vault.status === 'idle' || vault.status === 'loading') return <Screen header={header} padBottom={false}><SkeletonRows count={6} /></Screen>;
  if (vault.status === 'error') return <Screen header={header} padBottom={false}><ErrorState body={vault.error ?? ''} onRetry={vault.reload} /></Screen>;
  if (vault.assets.length === 0) {
    return (
      <Screen header={header} padBottom={false}>
        <EmptyState icon="layers" title="No assets registered" body="Register a property, vehicle or valuable to keep its details and documents together." action={{ label: 'Register an asset', icon: 'plus', onPress: () => router.push('/asset/new') }} />
      </Screen>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const ok = await vault.refresh();
    setRefreshing(false);
    if (!ok) toast.show('Couldn’t refresh. Try again.', 'error');
  };

  return (
    <Screen header={header} scroll={false} padBottom={false}>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.patina]} progressBackgroundColor={colors.folio} />}
        contentContainerStyle={{ paddingBottom: space.x3 }}
        ListHeaderComponent={
          <View style={styles.filters}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search by name or folio" />
            <Chips
              value={category}
              onChange={setCategory}
              options={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: categoryMeta[c].plural }))]}
            />
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.rule }} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="search" title="No matching assets" body="Try a different name or folio number, or choose another category." action={{ label: 'Clear filters', onPress: () => { setQuery(''); setCategory('all'); } }} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({ filters: { gap: space.md, paddingBottom: space.md } });
