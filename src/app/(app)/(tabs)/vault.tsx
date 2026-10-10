import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppText, Chips, EmptyState, Entry, ErrorState, HeaderIconButton, Screen, ScreenHeader, SearchField, SkeletonRows, Tag, useToast,
} from '@/components';
import { kindMeta } from '@/domain/labels';
import { isActiveShare } from '@/domain/selectors';
import type { DocumentKind } from '@/domain/types';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { daysUntil } from '@/utils/date';
import { formatBytes, expiryLabel, plural } from '@/utils/format';

export default function Vault() {
  const router = useRouter();
  const toast = useToast();
  const vault = useVault();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | DocumentKind>('all');
  const [refreshing, setRefreshing] = useState(false);

  const kinds = useMemo(() => Array.from(new Set(vault.documents.map((d) => d.kind))), [vault.documents]);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vault.documents.filter((d) => (kind === 'all' || d.kind === kind) && (!q || d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)));
  }, [vault.documents, query, kind]);

  const size = vault.documents.reduce((s, d) => s + d.sizeBytes, 0);
  const header = (
    <ScreenHeader
      title="Vault"
      subtitle={vault.status === 'ready' && vault.documents.length ? `${plural(vault.documents.length, 'document')}, ${formatBytes(size)}` : undefined}
      right={<HeaderIconButton icon="upload" label="Add a document" onPress={() => router.push('/document/upload')} />}
    />
  );

  if (vault.status === 'idle' || vault.status === 'loading') return <Screen header={header} padBottom={false}><SkeletonRows count={6} /></Screen>;
  if (vault.status === 'error') return <Screen header={header} padBottom={false}><ErrorState body={vault.error ?? ''} onRetry={vault.reload} /></Screen>;
  if (vault.documents.length === 0) {
    return (
      <Screen header={header} padBottom={false}>
        <EmptyState icon="archive" title="No documents yet" body="Add deeds, policies, invoices and identity papers. You can link each one to an asset and decide who may see it." action={{ label: 'Add a document', icon: 'upload', onPress: () => router.push('/document/upload') }} />
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
        keyExtractor={(d) => d.id}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.patina]} progressBackgroundColor={colors.folio} />}
        contentContainerStyle={{ paddingBottom: space.x3 }}
        ListHeaderComponent={
          <View style={styles.filters}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search documents" />
            <Chips value={kind} onChange={setKind} options={[{ value: 'all', label: 'All' }, ...kinds.map((k) => ({ value: k, label: kindMeta[k].plural }))]} />
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.rule }} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="search" title="No matching documents" body="Try a different title, or choose another type." action={{ label: 'Clear filters', onPress: () => { setQuery(''); setKind('all'); } }} />
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
                  {left === null || left > 60 ? <AppText variant="caption" tone="muted">{sharedWith ? `Shared with ${sharedWith}` : 'Private'}</AppText> : null}
                </View>
              }
              onPress={() => router.push(`/document/${d.id}`)}
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ filters: { gap: space.md, paddingBottom: space.md } });
