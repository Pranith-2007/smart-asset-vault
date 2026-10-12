import { Redirect, Stack } from 'expo-router';
import { colors } from '@/theme';
import { useSession } from '@/state/session';

export default function AppLayout() {
  const { inPreview, isAuthenticated, isLoading } = useSession();
  if (isLoading) return null;

if (!inPreview && !isAuthenticated) {
  return <Redirect href="/login" />;
}
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}
