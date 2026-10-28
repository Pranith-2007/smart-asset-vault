
import { useRouter } from 'expo-router';

import LandingPage from '@/landing/LandingPage';

export default function IndexPage() {
  const router = useRouter();

  const goToPortal = () => {
    router.push('/portal');
  };

  const goToSignIn = () => {
    router.push({
      pathname: '/(auth)/login',
      params: { portal: 'personal' },
    });
  };

  return (
    <LandingPage
      onSignIn={goToSignIn}
      onChoosePortal={goToPortal}
    />
  );
}
