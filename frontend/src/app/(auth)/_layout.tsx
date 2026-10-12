import { Redirect, Stack } from 'expo-router';
import { colors } from '@/theme';
import { useSession } from '@/state/session';

export default function AppLayout() {
  const { inPreview } = useSession();
  if (inPreview) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}