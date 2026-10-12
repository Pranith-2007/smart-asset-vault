import { useRouter } from 'expo-router';
import { useVault } from '@/state/vault';
import { EmptyState, ErrorState, SkeletonRows } from './States';
import { Screen } from './Screen';
import { ScreenHeader } from './ScreenHeader';
import { useBack } from '@/hooks/useBack';

/** Shared guard for detail screens: returns a screen to render when the record can't be shown yet, else null. */
export function useDetailGuard(title: string, exists: boolean, noun: string) {
  const vault = useVault();
  const router = useRouter();
  const back = useBack();
  const header = <ScreenHeader title={title} onBack={back} />;
  if (vault.status === 'idle' || vault.status === 'loading') return <Screen header={header}><SkeletonRows count={4} icon={false} /></Screen>;
  if (vault.status === 'error') return <Screen header={header}><ErrorState body={vault.error ?? ''} onRetry={vault.reload} /></Screen>;
  if (!exists) {
    return (
      <Screen header={header}>
        <EmptyState icon="search" title={`We can’t find this ${noun}`} body="It may have been removed, or the link is out of date." action={{ label: 'Go to overview', onPress: () => router.replace('/') }} />
      </Screen>
    );
  }
  return null;
}
