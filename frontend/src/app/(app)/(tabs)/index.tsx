import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppText, Avatar, Button, Dial, EmptyState, Entry, ErrorState, Register, Screen, ScreenHeader, SectionHeader, SkeletonRows, useToast,
} from '@/components';
import { activityHref, isActiveShare, totalDeclaredValue } from '@/domain/selectors';
import { activityIcon } from '@/domain/labels';
import { useSecurity } from '@/state/security';
import { useSession } from '@/state/session';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';
import { formatINRCompact, formatLongDay, greeting, plural, timeAgo } from '@/utils/format';

export default function Overview() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useSession();
  const vault = useVault();
  const { checks, met, total } = useSecurity();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const ok = await vault.refresh();
    setRefreshing(false);
    if (!ok) toast.show('Couldn’t refresh. Try again.', 'error');
  };

  const attention = checks.filter((c) => !c.met);
  const header = (
    <ScreenHeader
      title={`${greeting()}, ${user.firstName}`}
      subtitle={formatLongDay()}
      right={
        <Pressable onPress={() => router.navigate('/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
          <Avatar name={user.name} />
        </Pressable>
      }
    />
  );

  if (vault.status === 'idle' || vault.status === 'loading') {
    return <Screen header={header} padBottom={false}><View style={{ height: 150 }} /><SkeletonRows count={5} /></Screen>;
  }
  if (vault.status === 'error') {
    return <Screen header={header} padBottom={false}><ErrorState body={vault.error ?? 'Check your connection and try again.'} onRetry={vault.reload} /></Screen>;
  }
  if (vault.assets.length === 0 && vault.documents.length === 0) {
    return (
      <Screen header={header} padBottom={false}>
        <EmptyState
          icon="archive"
          title="Your vault is empty"
          body="Register the first thing you own, then add the documents that prove it. Everything stays in one place."
          action={{ label: 'Register an asset', icon: 'plus', onPress: () => router.push('/asset/new') }}
          secondary={{ label: 'Add a document', onPress: () => router.push('/document/upload') }}
        />
      </Screen>
    );
  }

  const open = (href?: string) => (href ? () => router.push(href) : undefined);

  return (
    <Screen
      header={header}
      padBottom={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.patina]} progressBackgroundColor={colors.folio} />}
    >
      <View style={styles.dialPanel}>
        <Dial value={met} total={total} />
        <View style={{ flex: 1, gap: space.sm }}>
          <AppText variant="heading">{attention.length === 0 ? 'Every check is complete' : `${plural(attention.length, 'check')} to review`}</AppText>
          <AppText variant="small" tone="muted">Based on your settings and records. Preview only: nothing is enforced yet.</AppText>
          <Button title="Security settings" variant="secondary" compact onPress={() => router.push('/security')} style={{ alignSelf: 'flex-start' }} />
        </View>
      </View>

      {attention.length > 0 ? (
        <>
          <SectionHeader title="Needs attention" count={attention.length} />
          <Register>
            {attention.slice(0, 4).map((c) => (
              <Entry key={c.id} icon="alert-triangle" iconTone="brass" title={c.label} subtitle={c.detail} titleLines={2} onPress={open(c.href)} />
            ))}
          </Register>
          {attention.length > 4 ? (
            <View style={{ paddingHorizontal: space.xl, paddingTop: space.sm }}>
              <Button title={`See all ${attention.length} checks`} variant="quiet" compact onPress={() => router.push('/security')} />
            </View>
          ) : null}
        </>
      ) : null}

      <SectionHeader title="On record" />
      <Register>
        <Entry title="Assets" meta={String(vault.assets.length)} onPress={() => router.navigate('/assets')} />
        <Entry title="Declared value" meta={formatINRCompact(totalDeclaredValue(vault))} />
        <Entry title="Documents" meta={String(vault.documents.length)} onPress={() => router.navigate('/vault')} />
        <Entry title="Active shares" meta={String(vault.shares.filter(isActiveShare).length)} onPress={() => router.navigate('/access')} />
      </Register>

      <SectionHeader title="Recent activity" action={{ label: 'See all', onPress: () => router.navigate({ pathname: '/access', params: { tab: 'history' } }) }} />
      {vault.activity.length === 0 ? (
        <EmptyState icon="clock" title="No activity yet" body="When you add documents or share them, each action is listed here." />
      ) : (
        <Register>
          {vault.activity.slice(0, 5).map((e) => (
            <Entry key={e.id} icon={activityIcon[e.kind]} title={e.summary} titleLines={2} subtitle={timeAgo(e.at)} onPress={open(activityHref(e))} />
          ))}
        </Register>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dialPanel: {
    flexDirection: 'row', alignItems: 'center', gap: space.xl, padding: space.xl,
    backgroundColor: colors.folio, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.rule,
  },
});
