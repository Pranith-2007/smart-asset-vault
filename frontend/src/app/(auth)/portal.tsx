import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, AuthBrand, PortalCard, Screen } from '@/components';
import { portalOrder, portals, type PortalId } from '@/domain/portals';
import { space } from '@/theme';

/** First screen of the app. Choosing a portal only carries the choice to sign-in; it signs nobody in. */
export default function PortalSelect() {
  const router = useRouter();
  const choose = (portal: PortalId) => router.push({ pathname: '/login', params: { portal } });

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.x3, gap: space.x3 }}>
        <AuthBrand />
        <View style={{ gap: space.md }}>
          <AppText variant="display" accessibilityRole="header">Your identity. Your assets. Your control.</AppText>
          <AppText variant="bodyLarge" tone="soft">Choose how you’ll use Smart Asset Vault.</AppText>
        </View>

        <View style={{ gap: space.lg }}>
          {portalOrder.map((id) => (
            <PortalCard key={id} portal={portals[id]} onPress={() => choose(id)} />
          ))}
        </View>

        <AppText variant="small" tone="muted">
          Choosing a portal doesn’t sign you in or give you access to anything. What each account can see is decided by the backend, once it’s connected.
        </AppText>
      </View>
    </Screen>
  );
}
