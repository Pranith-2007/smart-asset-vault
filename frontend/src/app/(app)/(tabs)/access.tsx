import { Fragment, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText, EmptyState, Entry, ErrorState, Register, Screen, ScreenHeader, Segmented, SectionHeader, SkeletonRows, Tag, useToast, Icon,
} from '@/components';
import { accessLabel, activityIcon } from '@/domain/labels';
import { activityHref, isActiveShare } from '@/domain/selectors';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { daysUntil } from '@/utils/date';
import { dayHeading, expiryLabel, formatTime, plural } from '@/utils/format';

export default function Access() {
  const router = useRouter();
  const toast = useToast();
  const vault = useVault();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [view, setView] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (tab === 'history') setView('history');
  }, [tab]);

  const active = useMemo(
    () =>
      vault.shares
        .filter(isActiveShare)
        .sort(
          (a, b) =>
            (a.expiresOn ? new Date(a.expiresOn).getTime() : Infinity) -
            (b.expiresOn ? new Date(b.expiresOn).getTime() : Infinity),
        ),
    [vault.shares],
  );

  const groups = useMemo(() => {
    const out: { heading: string; items: typeof vault.activity }[] = [];
    for (const e of vault.activity) {
      const heading = dayHeading(e.at);
      const last = out[out.length - 1];
      if (last && last.heading === heading) last.items.push(e);
      else out.push({ heading, items: [e] });
    }
    return out;
  }, [vault.activity]);

  const expiringSoon = active.filter(
    (s) => s.expiresOn && daysUntil(s.expiresOn) <= 7,
  ).length;

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <ScreenHeader
          title="Access"
          subtitle={
            vault.status === 'ready'
              ? `${plural(active.length, 'active share')}${expiringSoon ? `, ${expiringSoon} expiring this week` : ''}`
              : undefined
          }
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={() => router.push('/(app)/(tabs)/profile')}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.folio,
          borderWidth: 1,
          borderColor: colors.rule,
          marginRight: space.xl,
        }}
      >
        <Icon name="user" size={22} color={colors.patina} />
      </Pressable>
    </View>
  );

  if (vault.status === 'idle' || vault.status === 'loading') {
    return <Screen header={header} padBottom={false}><SkeletonRows count={5} /></Screen>;
  }

  if (vault.status === 'error') {
    return <Screen header={header} padBottom={false}><ErrorState body={vault.error ?? ''} onRetry={vault.reload} /></Screen>;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const ok = await vault.refresh();
    setRefreshing(false);
    if (!ok) toast.show('Couldn’t refresh. Try again.', 'error');
  };

  return (
    <Screen
      header={header}
      padBottom={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.patina]}
          progressBackgroundColor={colors.folio}
        />
      }
    >
      <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'active', label: 'Active shares' },
            { value: 'history', label: 'History' },
          ]}
        />
      </View>

      {view === 'active' ? (
        active.length === 0 ? (
          <EmptyState
            icon="lock"
            title="Only you can open your documents"
            body="Nothing is shared right now. When you share a document, the person and the expiry are listed here so you can revoke access at any time."
            action={{ label: 'Choose a document', onPress: () => router.navigate('/vault') }}
          />
        ) : (
          <Register>
            {active.map((s) => {
              const doc = vault.documents.find((d) => d.id === s.documentId);
              const left = s.expiresOn ? daysUntil(s.expiresOn) : null;
              return (
                <Entry
                  key={s.id}
                  icon="user"
                  title={s.recipientName}
                  subtitle={doc?.title ?? 'Removed document'}
                  metaSub={
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Tag label={accessLabel[s.access]} />
                      {left === null ? (
                        <Tag label="No expiry" tone="warn" />
                      ) : (
                        <AppText variant="caption" tone={left <= 7 ? 'brass' : 'muted'}>
                          {expiryLabel(s.expiresOn)}
                        </AppText>
                      )}
                    </View>
                  }
                  onPress={() => router.push(`/share/${s.id}`)}
                />
              );
            })}
          </Register>
        )
      ) : groups.length === 0 ? (
        <EmptyState
          icon="clock"
          title="No history yet"
          body="Every share, view, download and revoke is recorded here once you start sharing documents."
        />
      ) : (
        groups.map((g) => (
          <Fragment key={g.heading}>
            <SectionHeader title={g.heading} />
            <Register>
              {g.items.map((e) => (
                <Entry
                  key={e.id}
                  icon={activityIcon[e.kind]}
                  iconTone={e.kind === 'revoked' ? 'brick' : 'patina'}
                  title={e.summary}
                  titleLines={2}
                  subtitle={formatTime(e.at)}
                  onPress={activityHref(e) ? () => router.push(activityHref(e)!) : undefined}
                />
              ))}
            </Register>
          </Fragment>
        ))
      )}

      <View style={{ height: space.lg }} />
      <AppText variant="small" tone="muted" style={{ paddingHorizontal: space.xl }}>
        Preview data. Recipients can’t actually open anything until the backend is connected.
      </AppText>
    </Screen>
  );
}