import { useRouter } from 'expo-router';
import { EmptyState, Screen, ScreenHeader } from '@/components';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen header={<ScreenHeader title="Page not found" />}>
      <EmptyState icon="compass" title="This page doesn’t exist" body="The link may be out of date. Go back to your overview." action={{ label: 'Go to overview', onPress: () => router.replace('/') }} />
    </Screen>
  );
}
