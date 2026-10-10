import { useRouter } from 'expo-router';

/** Goes back, or to the overview when the screen was opened directly (no history). */
export function useBack() {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace('/'));
}
