
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AllDocumentsCard,
  AppText,
  Avatar,
  Button,
  DocumentCard,
  Entry,
  ErrorState,
  Icon,
  OptionSheet,
  PlainSection,
  Register,
  Screen,
  SkeletonRows,
  useToast,
} from '@/components';

import { activityHref } from '@/domain/selectors';
import { activityIcon } from '@/domain/labels';
import {
  featuredDocuments,
  featuredTypes,
  type FeaturedType,
} from '@/domain/featured';
import type { VaultDocument } from '@/domain/types';

import { useSecurity } from '@/state/security';
import { useSession } from '@/state/session';
import { useVault } from '@/state/vault';

import { colors, space } from '@/theme';
import {
  formatDate,
  formatLongDay,
  greeting,
  plural,
  timeAgo,
} from '@/utils/format';

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useSession();
  const vault = useVault();
  const { checks } = useSecurity();
  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const [chooser, setChooser] = useState<{
    title: string;
    docs: VaultDocument[];
  } | null>(null);

  const cardWidth = Math.min(300, Math.round(width * 0.72));
  const attention = checks.filter((c) => !c.met);

  const onRefresh = async () => {
    setRefreshing(true);
    const ok = await vault.refresh();
    setRefreshing(false);

    if (!ok) {
      toast.show("Couldn't refresh. Try again.", 'error');
    }
  };

  const greetingBlock = (
    <View style={styles.greeting}>
      <View style={styles.greetingText}>
        <AppText
          variant="headline"
          accessibilityRole="header"
          style={styles.greetingTitle}
        >
          {`${greeting()}, ${user.firstName}`}
        </AppText>

        <AppText tone="muted" style={styles.date}>
          {formatLongDay()}
        </AppText>
      </View>

      <Pressable
        onPress={() => router.push('/profile')}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        hitSlop={8}
        style={styles.profileButton}
      >
        <Avatar name={user.firstName} size={42} />
      </Pressable>
    </View>
  );

  if (vault.status === 'idle' || vault.status === 'loading') {
    return (
      <Screen header={greetingBlock} padBottom={false}>
        <View style={{ height: 190 }} />
        <SkeletonRows count={4} />
      </Screen>
    );
  }

  if (vault.status === 'error') {
    return (
      <Screen header={greetingBlock} padBottom={false}>
        <ErrorState
          body={vault.error ?? 'Check your connection and try again.'}
          onRetry={vault.reload}
        />
      </Screen>
    );
  }

  const goUpload = (t: FeaturedType) =>
    router.push({
      pathname: '/document/upload',
      params: {
        kind: t.preset.kind,
        title: t.preset.title,
      },
    });

  const open = (t: FeaturedType, docs: VaultDocument[]) => {
    if (docs.length === 0) {
      goUpload(t);
    } else if (docs.length === 1) {
      router.push(`/document/${docs[0].id}`);
    } else {
      router.navigate({
        pathname: '/documents',
        params: { filter: t.key },
      });
    }
  };

  const share = (t: FeaturedType, docs: VaultDocument[]) => {
    if (docs.length === 0) {
      goUpload(t);
    } else if (docs.length === 1) {
      router.push(`/document/${docs[0].id}/share`);
    } else {
      setChooser({ title: t.title, docs });
    }
  };

  const goHref = (href?: string) =>
    href ? () => router.push(href) : undefined;

  return (
    <Screen
      header={greetingBlock}
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
      <PlainSection
        title="My documents"
        action={{
          label: 'All documents',
          onPress: () => router.navigate('/documents'),
        }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + space.md}
        snapToAlignment="start"
        contentContainerStyle={styles.cards}
      >
        {featuredTypes.map((t) => {
          const docs = featuredDocuments(t.key, vault);

          const statement =
            docs.length === 0
              ? `${t.blurb}. Not added yet.`
              : docs.length === 1
                ? `${t.blurb}. Added ${formatDate(docs[0].addedOn)}.`
                : `${plural(docs.length, 'document')}. ${t.blurb}.`;

          return (
            <DocumentCard
              key={t.key}
              title={t.title}
              statement={statement}
              icon={t.icon}
              tint={t.tint}
              width={cardWidth}
              actionLabel={docs.length === 0 ? 'Add' : 'Share'}
              actionIcon={docs.length === 0 ? 'plus' : 'share-2'}
              onOpen={() => open(t, docs)}
              onAction={() => share(t, docs)}
            />
          );
        })}

        <AllDocumentsCard
          width={cardWidth}
          statement={`${plural(vault.documents.length, 'document')} and ${plural(vault.assets.length, 'asset')}`}
          onOpen={() => router.navigate('/documents')}
        />
      </ScrollView>

      <PlainSection title="Needs attention" />

      {attention.length === 0 ? (
        <View style={styles.allGood}>
          <Icon
            name="check-circle"
            size={22}
            color={colors.patina}
          />
          <AppText style={styles.allGoodText}>
            Everything looks good. Nothing needs your attention.
          </AppText>
        </View>
      ) : (
        <>
          <Register>
            {attention.slice(0, 4).map((c) => (
              <Entry
                key={c.id}
                icon="alert-triangle"
                iconTone="brass"
                title={c.detail ?? c.label}
                titleLines={3}
                onPress={goHref(c.href)}
              />
            ))}
          </Register>

          {attention.length > 4 ? (
            <View style={styles.seeAll}>
              <Button
                title={`See all ${attention.length} items`}
                variant="quiet"
                compact
                onPress={() => router.push('/security')}
              />
            </View>
          ) : null}
        </>
      )}

      <PlainSection
        title="Recent activity"
        action={{
          label: 'See all',
          onPress: () =>
            router.navigate({
              pathname: '/access',
              params: { tab: 'history' },
            }),
        }}
      />

      {vault.activity.length === 0 ? (
        <AppText tone="muted" style={styles.emptyActivity}>
          Nothing yet. When you add or share a document, it is listed here.
        </AppText>
      ) : (
        <Register>
          {vault.activity.slice(0, 5).map((e) => (
            <Entry
              key={e.id}
              icon={activityIcon[e.kind]}
              title={e.summary}
              titleLines={3}
              subtitle={timeAgo(e.at)}
              onPress={goHref(activityHref(e))}
            />
          ))}
        </Register>
      )}

      <OptionSheet
        visible={!!chooser}
        title="Which document do you want to share?"
        selected={null}
        onClose={() => setChooser(null)}
        onSelect={(id) => router.push(`/document/${id}/share`)}
        options={(chooser?.docs ?? []).map((d) => ({
          value: d.id,
          label: d.title,
          sublabel: `Added ${formatDate(d.addedOn)}`,
        }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.xs,
    gap: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    flex: 1,
    gap: 2,
  },
  greetingTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  date: {
    fontSize: 16,
  },
  profileButton: {
    padding: 4,
    borderRadius: 999,
  },
  cards: {
    paddingHorizontal: space.xl,
    gap: space.md,
    paddingBottom: space.xs,
  },
  allGood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.xl,
    padding: space.lg,
    borderRadius: 12,
    backgroundColor: colors.patinaTint,
  },
  allGoodText: {
    flex: 1,
    fontSize: 17,
  },
  seeAll: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
  },
  emptyActivity: {
    paddingHorizontal: space.xl,
    fontSize: 16,
  },
});
