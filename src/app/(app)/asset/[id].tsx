import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, EmptyState, Entry, KeyValue, Register, Screen, ScreenHeader, SectionHeader, Tag, useDetailGuard } from '@/components';
import { activityIcon, categoryMeta, kindMeta } from '@/domain/labels';
import { activityHref, documentsForAsset } from '@/domain/selectors';
import { useBack } from '@/hooks/useBack';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { daysUntil } from '@/utils/date';
import { expiryLabel, formatDate, formatINR, timeAgo } from '@/utils/format';

export default function AssetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const back = useBack();
  const vault = useVault();
  const asset = vault.assets.find((a) => a.id === id);
  const guard = useDetailGuard('Asset', !!asset, 'asset');
  if (guard || !asset) return guard;

  const docs = documentsForAsset(vault, asset.id);
  const docIds = new Set(docs.map((d) => d.id));
  const events = vault.activity.filter((e) => e.assetId === asset.id || (e.documentId && docIds.has(e.documentId))).slice(0, 5);
  const open = (href?: string) => (href ? () => router.push(href) : undefined);

  return (
    <Screen header={<ScreenHeader title={asset.name} subtitle={`${asset.folio}, ${categoryMeta[asset.category].label}`} onBack={back} />}>
      <View style={{ backgroundColor: colors.folio, padding: space.xl, gap: space.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.rule }}>
        <AppText variant="small" tone="muted">Declared value</AppText>
        <AppText variant="display">{formatINR(asset.declaredValue)}</AppText>
        <Tag label={asset.status === 'pledged' ? 'Pledged as security' : 'Active'} tone={asset.status === 'pledged' ? 'warn' : 'good'} />
      </View>

      {asset.description ? <AppText tone="soft" style={{ paddingHorizontal: space.xl, paddingTop: space.xl }}>{asset.description}</AppText> : null}

      <SectionHeader title="Details" />
      <Register>
        <KeyValue label="Folio" value={asset.folio} />
        <KeyValue label="Category" value={categoryMeta[asset.category].label} />
        <KeyValue label="Location" value={asset.location} />
        <KeyValue label="Acquired" value={formatDate(asset.acquiredOn)} last />
      </Register>

      <SectionHeader title="Documents" count={docs.length} action={docs.length ? { label: 'Add', onPress: () => router.push({ pathname: '/document/upload', params: { assetId: asset.id } }) } : undefined} />
      {docs.length === 0 ? (
        <EmptyState icon="file-text" title="No documents for this asset" body="Add the deed, invoice or policy that shows you own it. You can share it later with whoever needs to see it." action={{ label: 'Add a document', icon: 'upload', onPress: () => router.push({ pathname: '/document/upload', params: { assetId: asset.id } }) }} />
      ) : (
        <Register>
          {docs.map((d) => {
            const left = d.expiresOn ? daysUntil(d.expiresOn) : null;
            return (
              <Entry
                key={d.id}
                icon={kindMeta[d.kind].icon}
                title={d.title}
                subtitle={kindMeta[d.kind].label}
                metaSub={
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {left !== null && left < 0 ? <Tag label="Expired" tone="bad" /> : left !== null && left <= 60 ? <Tag label={expiryLabel(d.expiresOn)} tone="warn" icon="clock" /> : null}
                    {d.certifiedCopy ? <Tag label="Certified copy" tone="seal" icon="award" /> : null}
                  </View>
                }
                onPress={() => router.push(`/document/${d.id}`)}
              />
            );
          })}
        </Register>
      )}

      {events.length ? (
        <>
          <SectionHeader title="Activity" />
          <Register>
            {events.map((e) => (
              <Entry key={e.id} icon={activityIcon[e.kind]} title={e.summary} titleLines={2} subtitle={timeAgo(e.at)} onPress={open(activityHref(e))} />
            ))}
          </Register>
        </>
      ) : null}

      <View style={{ padding: space.xl }}>
        <Button title="Add a document" variant="secondary" icon="upload" onPress={() => router.push({ pathname: '/document/upload', params: { assetId: asset.id } })} />
      </View>
    </Screen>
  );
}
