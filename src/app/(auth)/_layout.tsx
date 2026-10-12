
import { Redirect, Stack } from 'expo-router';
import { colors } from '@/theme';
import { useSession } from '@/state/session';

export default function AuthLayout() {
  const { inPreview, isAuthenticated, isLoading } = useSession();

  if (isLoading) return null;

  if (inPreview || isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.paper },
      }}
    />
  );
}
