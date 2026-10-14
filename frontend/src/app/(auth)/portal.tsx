
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, AuthBrand, PortalCard, Screen } from '@/components';
import { portalOrder, portals, type PortalId } from '@/domain/portals';
import { space } from '@/theme';

export default function PortalSelect() {
  const router = useRouter();

  
const choose = (id: PortalId) => {
  if (id === 'organisation') {
    router.push('/(auth)/organisation-coming-soon');
    return;
  }

  if (id === 'personal') {
    router.push({
      pathname: '/(auth)/login',
      params: { portal: 'personal' },
    });
  }
};


  return (
    <Screen>
      <View
        style={{
          paddingHorizontal: space.xl,
          paddingTop: space.x3,
          gap: space.x3,
        }}
      >
        <AuthBrand />

        <View style={{ gap: space.md }}>
          <AppText variant="display" accessibilityRole="header">
            Your identity. Your assets. Your control.
          </AppText>

          <AppText variant="bodyLarge" tone="soft">
            Choose how you’ll use Smart Asset Vault.
          </AppText>
        </View>

        <View style={{ gap: space.lg }}>
          {portalOrder
            .filter((id) => id !== 'government')
            .map((id) => (
              <PortalCard
                key={id}
                portal={portals[id]}
                onPress={() => choose(id)}
              />
            ))}
        </View>

        <AppText variant="small" tone="muted">
          Choosing a portal doesn’t sign you in or grant access. What each
          account can access is determined by its permissions.
        </AppText>
      </View>
    </Screen>
  );
}