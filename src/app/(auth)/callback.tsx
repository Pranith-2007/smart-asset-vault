import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { AppText, Button, Screen } from '@/components';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      try {
        const url = await Linking.getInitialURL();

        if (!url) {
          throw new Error(
            'No verification link was received. Open the link from your email again.',
          );
        }

        const parsed = Linking.parse(url);
        const params = parsed.queryParams ?? {};
        const code =
          typeof params.code === 'string' ? params.code : undefined;

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;
        } else {
          const fragment = url.split('#')[1] ?? '';
          const hashParams = new URLSearchParams(fragment);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const errorDescription = hashParams.get('error_description');

          if (errorDescription) {
            throw new Error(errorDescription);
          }

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
          } else {
            throw new Error(
              'The verification link is incomplete or has expired. Request a new one.',
            );
          }
        }

        if (!active) return;

        setMessage('Email verified! Redirecting to your vault...');
        router.replace('/');
      } catch (error) {
        if (!active) return;

        console.error('Auth callback failed:', error);
        setFailed(true);
        setMessage(
          error instanceof Error
            ? error.message
            : 'Verification failed. Please try again.',
        );
      }
    }

    void handleCallback();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          padding: space.xl,
          justifyContent: 'center',
          alignItems: 'center',
          gap: space.lg,
        }}
      >
        <AppText variant="title">
          {failed ? 'Verification unsuccessful' : 'Email verification'}
        </AppText>

        <AppText tone="soft">{message}</AppText>

        {failed ? (
          <Button
            title="Return to sign in"
            onPress={() => router.replace('/login')}
          />
        ) : null}
      </View>
    </Screen>
  );
}