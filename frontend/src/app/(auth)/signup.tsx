import { useState } from 'react';
import { View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  Redirect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  AppText,
  Banner,
  Button,
  Field,
  Icon,
  PasswordToggle,
  Screen,
  ScreenHeader,
  SelectedPortal,
} from '@/components';

import { parsePortal, portals } from '@/domain/portals';
import { authService, NotConnectedError } from '@/services';
import { colors, space } from '@/theme';
import {
  isEmail,
  passwordRules,
  passwordScore,
} from '@/utils/validation';

export default function Signup() {
  const router = useRouter();

  const { portal: portalParam } =
    useLocalSearchParams<{ portal?: string }>();

  const portalId = parsePortal(portalParam);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [aadhaarFile, setAadhaarFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [aadhaarError, setAadhaarError] = useState('');

  const [notice, setNotice] = useState<
    'not-connected' | 'failed' | 'confirmation' | null
  >(null);

  const score = passwordScore(password);

  const errors = {
    name:
      name.trim().length < 2
        ? 'Enter your full name.'
        : undefined,

    email: !isEmail(email)
      ? 'Enter a valid email address, like name@example.com.'
      : undefined,

    password:
      score < passwordRules.length
        ? 'Your password doesn’t meet every rule yet.'
        : undefined,

    confirm:
      confirm !== password
        ? 'The passwords don’t match.'
        : undefined,
  };

  const show_ = (key: keyof typeof errors) =>
    touched ? errors[key] : undefined;

  const chooseAadhaar = async () => {
    setAadhaarError('');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/jpeg',
          'image/png',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      if (
        file.size !== undefined &&
        file.size > 5 * 1024 * 1024
      ) {
        setAadhaarError('File must be smaller than 5 MB.');
        return;
      }

      setAadhaarFile(file);
    } catch (error) {
      console.error('Document picker error:', error);
      setAadhaarError(
        'Could not open the file picker. Please try again.',
      );
    }
  };

  const submit = async () => {
    setTouched(true);
    setNotice(null);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    if (portalId !== 'personal') {
      setNotice('failed');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.signUp({
        fullName: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.needsEmailConfirmation) {
        setNotice('confirmation');
      } else {
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof NotConnectedError) {
        setNotice('not-connected');
      } else {
        setNotice('failed');
        console.error('Sign-up failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!portalId) {
    return <Redirect href="/portal" />;
  }

  const portal = portals[portalId];

  return (
    <Screen
      header={
        <ScreenHeader
          title="Create your account"
          onBack={() => router.back()}
        />
      }
    >
      <View
        style={{
          paddingHorizontal: space.xl,
          gap: space.xxl,
          paddingBottom: space.xxl,
        }}
      >
        <SelectedPortal
          portal={portal}
          caption="Creating an account for"
          onChange={() => router.dismissTo('/portal')}
        />

        {portalId !== 'personal' ? (
          <Banner
            tone="info"
            title="Account creation for this portal isn’t designed yet"
            body="Organisation account creation is not available yet."
          />
        ) : null}

        <AppText tone="soft">
          Create your account and optionally select an identity
          document for the planned verification feature.
        </AppText>

        {notice === 'not-connected' ? (
          <Banner
            tone="warn"
            title="Sign-up isn’t available in this build"
            body="Account creation needs a working backend connection."
          />
        ) : notice === 'failed' ? (
          <Banner
            tone="bad"
            title="Couldn’t create your account"
            body="Check your details and connection, then try again. The email may already be registered."
          />
        ) : notice === 'confirmation' ? (
          <Banner
            tone="info"
            title="Check your email"
            body={`We sent a verification link to ${email.trim()}. Confirm your email, then return here to sign in.`}
          />
        ) : null}

        <View style={{ gap: space.lg }}>
          <Field
            label="Full name"
            value={name}
            onChangeText={setName}
            error={show_('name')}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={show_('email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={show_('password')}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            right={
              <PasswordToggle
                visible={show}
                onToggle={() =>
                  setShow((value) => !value)
                }
              />
            }
          />

          <View
            style={{ gap: 8 }}
            accessibilityLiveRegion="polite"
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 4,
              }}
            >
              {passwordRules.map((rule, index) => (
                <View
                  key={rule.id}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      index < score
                        ? colors.patina
                        : colors.rule,
                  }}
                />
              ))}
            </View>

            {passwordRules.map((rule) => {
              const ok = rule.test(password);

              return (
                <View
                  key={rule.id}
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name={ok ? 'check-circle' : 'circle'}
                    size={16}
                    color={
                      ok
                        ? colors.patina
                        : colors.ruleStrong
                    }
                  />

                  <AppText
                    variant="small"
                    tone={ok ? 'ink' : 'muted'}
                  >
                    {rule.label}
                  </AppText>
                </View>
              );
            })}
          </View>

          <Field
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            error={show_('confirm')}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoComplete="new-password"
            onSubmitEditing={submit}
          />
        </View>

        {/* Aadhaar document selection */}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.rule,
            borderRadius: 16,
            padding: space.lg,
            gap: space.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Icon
              name="check-circle"
              size={26}
              color={colors.patina}
            />

            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="body">
                Identity verification
              </AppText>

              <AppText
                variant="small"
                tone="muted"
              >
                Aadhaar document (optional)
              </AppText>
            </View>
          </View>

          <AppText
            variant="small"
            tone="soft"
          >
            Select a PDF, JPG or PNG file up to 5 MB.
            This prototype only selects the file; it does
            not upload or verify your document.
          </AppText>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.rule,
              borderStyle: 'dashed',
              borderRadius: 12,
              padding: space.lg,
              alignItems: 'center',
              gap: space.md,
            }}
          >
            {aadhaarFile ? (
              <>
                <Icon
                  name="check-circle"
                  size={30}
                  color={colors.patina}
                />

                <AppText>
                  {aadhaarFile.name}
                </AppText>

                <AppText
                  variant="small"
                  tone="muted"
                >
                  {aadhaarFile.size !== undefined
                    ? `${(
                        aadhaarFile.size /
                        (1024 * 1024)
                      ).toFixed(2)} MB`
                    : 'File selected'}
                </AppText>

                <Button
                  title="Choose another document"
                  variant="secondary"
                  onPress={chooseAadhaar}
                />

                <Button
                  title="Remove document"
                  variant="quiet"
                  onPress={() => {
                    setAadhaarFile(null);
                    setAadhaarError('');
                  }}
                />
              </>
            ) : (
              <>
                <AppText variant="body">
                  No document selected
                </AppText>

                <Button
                  title="Choose Aadhaar document"
                  onPress={chooseAadhaar}
                />
              </>
            )}
          </View>

          {aadhaarError ? (
            <AppText tone="soft">
              {aadhaarError}
            </AppText>
          ) : null}
        </View>

        <Button
          title="Create account"
          onPress={submit}
          loading={loading}
          disabled={loading}
        />

        <AppText
          variant="small"
          tone="muted"
        >
          Your selected document is not sent to the server
          by this screen. Avoid using a real Aadhaar document
          until secure storage and verification are implemented.
        </AppText>
      </View>
    </Screen>
  );
}