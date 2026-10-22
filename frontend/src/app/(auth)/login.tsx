
import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
AppText,
AuthBrand,
Banner,
Button,
Field,
PasswordToggle,
Screen,
SelectedPortal,
} from '@/components';
import { parsePortal, portals } from '@/domain/portals';
import { authService, NotConnectedError } from '@/services';
import { useSession } from '@/state/session';
import { colors, space } from '@/theme';
import { isEmail } from '@/utils/validation';

export default function Login() {
const router = useRouter();
const { portal: portalParam } = useLocalSearchParams<{ portal?: string }>();
const portalId = parsePortal(portalParam);
const { enterPreview } = useSession();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [show, setShow] = useState(false);
const [errors, setErrors] = useState<{
email?: string;
password?: string;
}>({});
const [loading, setLoading] = useState(false);
const [notice, setNotice] = useState<string | null>(null);

// If no valid portal was selected, return to the portal selection screen.
if (!portalId) {
return <Redirect href="/portal" />;
}

const portal = portals[portalId];

const submit = async () => {
const next: typeof errors = {};

if (!isEmail(email)) {
  next.email = 'Enter a valid email address, like name@example.com.';
}

if (!password) {
  next.password = 'Enter your password.';
}

setErrors(next);
setNotice(null);

if (Object.keys(next).length > 0) {
  return;
}

setLoading(true);

try {
  await authService.signIn({
    email: email.trim(),
    password,
  });

  // Supabase session is updated by the session provider.
  router.replace('/home');
} catch (e) {
  if (e instanceof NotConnectedError) {
    setNotice('not-connected');
  } else {
    setNotice('failed');
    console.error('Sign-in failed:', e);
  }
} finally {
  setLoading(false);
}

};

return (
<Screen padBottom>
<View
style={{
paddingHorizontal: space.xl,
paddingTop: space.x3,
gap: space.x3,
}}
>
<AuthBrand />

    <SelectedPortal
      portal={portal}
      caption="Signing in to"
      onChange={() => router.dismissTo('/portal')}
    />

    <View style={{ gap: space.md }}>
      <AppText variant="display">
        Your records, kept in order.
      </AppText>

      <AppText variant="bodyLarge" tone="soft">
        {portal.signInIntro}
      </AppText>
    </View>

    {notice === 'not-connected' ? (
      <Banner
        tone="warn"
        title="Sign-in isn’t available in this build"
        body="Accounts need the backend, which isn’t connected yet. Nothing you typed was sent anywhere. You can explore the app with sample data instead."
      />
    ) : notice === 'failed' ? (
      <Banner
        tone="bad"
        title="Couldn’t sign you in"
        body="Check your email and password, then try again. If your email needs verification, check your inbox."
      />
    ) : null}

    <View style={{ gap: space.lg }}>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />

      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        right={
          <PasswordToggle
            visible={show}
            onToggle={() => setShow((v) => !v)}
          />
        }
      />
    </View>

    <View style={{ gap: space.sm }}>
      <Button
        title="Sign in"
        onPress={submit}
        loading={loading}
      />

      <Button
        title="Create an account"
        variant="quiet"
        onPress={() =>
          router.push({
            pathname: '/signup',
            params: { portal: portal.id },
          })
        }
      />
    </View>

    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.rule,
        paddingTop: space.xl,
        gap: space.md,
      }}
    >
      <AppText variant="small" tone="muted">
        {portalId === 'personal'
          ? 'This is a preview build. Review the screens with fictional data. No account is created and nothing leaves your device.'
          : `The ${portal.title} screens aren’t part of this build yet. You can still review the Personal Vault with fictional data. No account is created and nothing leaves your device.`}
      </AppText>

      <Button
        title={
          portalId === 'personal'
            ? 'Explore with sample data'
            : 'Review the Personal Vault sample'
        }
        variant="secondary"
        icon="eye"
        onPress={() => {
          enterPreview();
          router.replace('/home');
        }}
      />
    </View>
  </View>
</Screen>

);
}