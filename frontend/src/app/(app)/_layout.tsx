
import { Redirect, Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { colors } from '@/theme';
import { useSession } from '@/state/session';
import { AppWebNavigation } from '@/components/AppWebNavigation';

export default function AppLayout() {
  const { inPreview, isAuthenticated, isLoading } = useSession();

  if (isLoading) return null;

  if (!inPreview && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      {Platform.OS === 'web' && <AppWebNavigation />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
    </View>
  );
}
