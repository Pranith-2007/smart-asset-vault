import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { AppText, Screen, ScreenHeader } from '@/components';
import { useBack } from '@/hooks/useBack';
import { useVault } from '@/state/vault';
import { colors, space } from '@/theme';

export default function SharedWithMeScreen() {
  const back = useBack();
  const vault = useVault();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadShares() {
      try {
        setError(null);
        const ok = await vault.refresh();

        if (!ok) {
          throw new Error('Could not refresh shared documents.');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Could not load shared documents.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadShares();

    return () => {
      cancelled = true;
    };
  }, []);

  const shares = (vault.receivedShares ?? []).filter(
    (share) => !share.revokedOn
  );

  return (
    <Screen>
      <ScreenHeader title="Shared with me" onBack={back} />

      {loading ? (
        <View style={{ padding: space.xl }}>
          <AppText>Loading shared documents...</AppText>
        </View>
      ) : error ? (
        <View style={{ padding: space.xl }}>
          <AppText>{error}</AppText>
          <Pressable onPress={() => router.replace('/shared')}>
            <AppText>Try again</AppText>
          </Pressable>
        </View>
      ) : shares.length === 0 ? (
        <View style={{ padding: space.xl }}>
          <AppText>Nothing shared with you yet</AppText>
          <AppText>
            Documents shared with your account will appear here.
          </AppText>
        </View>
      ) : (
        <View style={{ padding: space.xl, gap: space.md }}>
          {shares.map((share) => (
            <Pressable
              key={share.id}
              onPress={() => router.push(`/shared/${share.id}`)}
              style={{
                padding: space.lg,
                borderRadius: 12,
                backgroundColor: colors.patinaTint,
                gap: space.sm,
              }}
            >
              <AppText>{share.documentTitle}</AppText>
              <AppText>Shared with you</AppText>
              <AppText>
                {share.access === 'download' ? 'View and download' : 'View only'}
              </AppText>
              <AppText>Open document →</AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}