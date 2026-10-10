import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Banner, Button, Dial, Field, PasswordToggle, Screen } from '@/components';
import { authService, NotConnectedError } from '@/services';
import { useSession } from '@/state/session';
import { colors, space } from '@/theme';
import { isEmail } from '@/utils/validation';

function AuthBrand() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Dial value={8} size={40} showValue={false} />
      <AppText variant="heading">Smart Asset Vault</AppText>
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const { enterPreview } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = 'Enter a valid email address, like name@example.com.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setNotice(null);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await authService.signIn({ email: email.trim(), password });
    } catch (e) {
      setNotice(e instanceof NotConnectedError ? 'not-connected' : 'failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padBottom>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.x3, gap: space.x3 }}>
        <AuthBrand />
        <View style={{ gap: space.md }}>
          <AppText variant="display">Your records, kept in order.</AppText>
          <AppText variant="bodyLarge" tone="soft">
            Store ownership documents, keep track of what you own, and share access only for as long as you intend.
          </AppText>
        </View>

        {notice === 'not-connected' ? (
          <Banner tone="warn" title="Sign-in isn’t available in this build" body="Accounts need the backend, which isn’t connected yet. Nothing you typed was sent anywhere. You can explore the app with sample data instead." />
        ) : notice === 'failed' ? (
          <Banner tone="bad" title="Couldn’t sign you in" body="Check your email and password, then try again." />
        ) : null}

        <View style={{ gap: space.lg }}>
          <Field label="Email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" returnKeyType="next" />
          <Field
            label="Password" value={password} onChangeText={setPassword} error={errors.password}
            secureTextEntry={!show} autoCapitalize="none" autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit}
            right={<PasswordToggle visible={show} onToggle={() => setShow((v) => !v)} />}
          />
        </View>

        <View style={{ gap: space.sm }}>
          <Button title="Sign in" onPress={submit} loading={loading} />
          <Button title="Create an account" variant="quiet" onPress={() => router.push('/signup')} />
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.xl, gap: space.md }}>
          <AppText variant="small" tone="muted">This is a preview build. Review the screens with fictional data. No account is created and nothing leaves your device.</AppText>
          <Button
            title="Explore with sample data"
            variant="secondary"
            icon="eye"
            onPress={() => { enterPreview(); router.replace('/'); }}
          />
        </View>
      </View>
    </Screen>
  );
}
