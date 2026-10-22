
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText, AuthBrand, Button, Icon } from '@/components';
import { colors, space } from '@/theme';

const features = [
  {
    icon: 'lock' as const,
    title: 'A secure document vault',
    description:
      'Keep important digital documents organised and accessible in one place.',
  },
  {
    icon: 'shield' as const,
    title: 'Identity verification',
    description:
      'Support identity workflows through appropriate document verification.',
  },
  {
    icon: 'key' as const,
    title: 'Document integrity',
    description:
      'Cryptographic hashes can help detect changes compared with a registered original.',
  },
  {
    icon: 'users' as const,
    title: 'Controlled access',
    description:
      'Designed to support document sharing and access permissions.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  const goToPortal = () => {
    router.push('/portal');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{
        paddingHorizontal: space.xl,
        paddingTop: space.x3,
        paddingBottom: space.xxl,
        gap: space.xxl,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      <AuthBrand />

      <View style={{ gap: space.lg }}>
        <View
          style={{
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: colors.rule,
            borderRadius: 100,
            paddingHorizontal: space.md,
            paddingVertical: space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
          }}
        >
          <Icon name="shield" size={16} color={colors.patina} />
          <AppText variant="small">
            Your digital identity, in your control
          </AppText>
        </View>

        <AppText variant="display">
          Your documents.
          {'\n'}
          Your identity.
          {'\n'}
          Your control.
        </AppText>

        <AppText variant="bodyLarge" tone="soft">
          Smart Asset Vault helps you organise important digital
          documents, with a focus on privacy, integrity, and controlled access.
        </AppText>

        

<View style={{ gap: space.md }}>
  <AppText variant="heading">
    Made for individuals and organisations
  </AppText>

  <AppText variant="body" tone="soft">
    Choose the portal that fits your needs. Personal access
    is available in the current build, while organisation
    functionality is still being developed.
  </AppText>

  <Button
    title="Choose your portal"
    onPress={() => router.push('/portal')}
  />
</View>

      </View>

      <View
        style={{
          backgroundColor: colors.folio,
          borderRadius: 20,
          padding: space.lg,
          gap: space.md,
          borderWidth: 1,
          borderColor: colors.rule,
        }}
      >
        <AppText variant="heading">One vault. More confidence.</AppText>

        <AppText variant="body" tone="soft">
          A document management experience designed around privacy,
          integrity, and controlled access.
        </AppText>

        {features.map((feature) => (
          <View
            key={feature.title}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: space.md,
              paddingVertical: space.sm,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.paper,
                borderWidth: 1,
                borderColor: colors.rule,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name={feature.icon}
                size={20}
                color={colors.patina}
              />
            </View>

            <View style={{ flex: 1, gap: space.xs }}>
              <AppText variant="body">{feature.title}</AppText>
              <AppText variant="small" tone="soft">
                {feature.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>


      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.rule,
          paddingTop: space.lg,
          gap: space.sm,
        }}
      >
        <AppText variant="small" tone="muted">
          Smart Asset Vault
        </AppText>

        <AppText variant="small" tone="muted">
          Secure document management focused on privacy and integrity.
          Verification depends on the mechanisms implemented in the app.
        </AppText>
      </View>
    </ScrollView>
  );
}
