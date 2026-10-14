
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Screen, Icon } from '@/components';
import { colors, space } from '@/theme';

export default function OrganisationComingSoon() {
  const router = useRouter();

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: space.xl,
          gap: space.lg,
        }}
      >
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: '#E8F1FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="briefcase" size={36} color="#2764C5" />
        </View>

        <AppText variant="display" accessibilityRole="header">
          Organisation Portal
        </AppText>

        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#E8F1FF',
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
          }}
        >
          <AppText variant="small" style={{ color: '#2764C5' }}>
            UNDER CONSTRUCTION
          </AppText>
        </View>

        <AppText variant="bodyLarge" tone="soft">
          We’re building a dedicated space for organisations to manage shared
          asset records securely.
        </AppText>

        <View style={{ gap: space.md }}>
          {[
            'Secure access and permissions',
            'Organisation asset management',
            'Team-based access controls',
          ].map((item) => (
            <View
              key={item}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Icon name="check-circle" size={20} color={colors.patina} />
              <AppText variant="body">{item}</AppText>
            </View>
          ))}
        </View>

        <AppText variant="body" tone="muted">
          This portal isn’t available yet. Please check back later.
        </AppText>

        <Pressable
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', paddingVertical: 12 }}
        >
          <AppText
            variant="body"
            style={{ color: colors.patina, fontWeight: '600' }}
          >
            ← Back to portal selection
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
