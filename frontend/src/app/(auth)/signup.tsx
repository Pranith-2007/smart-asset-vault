import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Banner, Button, Field, Icon, PasswordToggle, Screen, ScreenHeader, SelectedPortal } from '@/components';
import { parsePortal, portals } from '@/domain/portals';
import { authService, NotConnectedError } from '@/services';
import { colors, space } from '@/theme';
import { isEmail, passwordRules, passwordScore } from '@/utils/validation';

export default function Signup() {
  const router = useRouter();
  const { portal: portalParam } = useLocalSearchParams<{ portal?: string }>();
  const portalId = parsePortal(portalParam);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<'not-connected' | 'failed' | null>(null);

  const score = passwordScore(password);
  const errors = {
    name: name.trim().length < 2 ? 'Enter your full name.' : undefined,
    email: !isEmail(email) ? 'Enter a valid email address, like name@example.com.' : undefined,
    password: score < passwordRules.length ? 'Your password doesn’t meet every rule yet.' : undefined,
    confirm: confirm !== password ? 'The passwords don’t match.' : undefined,
  };
  const show_ = (k: keyof typeof errors) => (touched ? errors[k] : undefined);

  // Opened without a valid portal (direct link): start from the portal screen.
  if (!portalId) return <Redirect href="/portal" />;
  const portal = portals[portalId];

  const submit = async () => {
    setTouched(true);
    setNotice(null);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      await authService.signUp({ fullName: name.trim(), email: email.trim(), password });
    } catch (e) {
      setNotice(e instanceof NotConnectedError ? 'not-connected' : 'failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<ScreenHeader title="Create your account" onBack={() => router.back()} />}>
      <View style={{ paddingHorizontal: space.xl, gap: space.xxl }}>
        <SelectedPortal portal={portal} caption="Creating an account for" onChange={() => router.dismissTo('/portal')} />
        {portalId !== 'personal' ? (
          <Banner tone="info" title="Account creation for this portal isn’t designed yet" body="Who may open an account here, and what it can see, will be decided and enforced by the backend." />
        ) : null}
        <AppText tone="soft">A name and a strong password are all you need. You’ll add recovery and sign-in protection after.</AppText>

        {notice === 'not-connected' ? (
          <Banner tone="warn" title="Sign-up isn’t available in this build" body="Account creation needs the backend, which isn’t connected yet. Nothing you typed was sent anywhere." />
        ) : notice === 'failed' ? (
          <Banner tone="bad" title="Couldn’t create your account" body="Check your details and try again." />
        ) : null}

        <View style={{ gap: space.lg }}>
          <Field label="Full name" value={name} onChangeText={setName} error={show_('name')} autoCapitalize="words" autoComplete="name" textContentType="name" />
          <Field label="Email" value={email} onChangeText={setEmail} error={show_('email')} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
          <Field
            label="Password" value={password} onChangeText={setPassword} error={show_('password')}
            secureTextEntry={!show} autoCapitalize="none" autoComplete="new-password" textContentType="newPassword"
            right={<PasswordToggle visible={show} onToggle={() => setShow((v) => !v)} />}
          />
          <View style={{ gap: 8 }} accessibilityLiveRegion="polite">
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {passwordRules.map((r, i) => (
                <View key={r.id} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < score ? colors.patina : colors.rule }} />
              ))}
            </View>
            {passwordRules.map((r) => {
              const ok = r.test(password);
              return (
                <View key={r.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Icon name={ok ? 'check-circle' : 'circle'} size={16} color={ok ? colors.patina : colors.ruleStrong} />
                  <AppText variant="small" tone={ok ? 'ink' : 'muted'}>{r.label}</AppText>
                </View>
              );
            })}
          </View>
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} error={show_('confirm')} secureTextEntry={!show} autoCapitalize="none" autoComplete="new-password" onSubmitEditing={submit} />
        </View>

        <View style={{ gap: space.sm }}>
          <Button title="Create account" onPress={submit} loading={loading} />
          <Button title="I already have an account" variant="quiet" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}