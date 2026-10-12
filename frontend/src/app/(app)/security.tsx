import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Banner, Entry, Field, Register, Screen, ScreenHeader, SectionHeader, Segmented, ToggleRow } from '@/components';
import { checkGroupTitle, type CheckGroup } from '@/domain/security';
import { useBack } from '@/hooks/useBack';
import { useSecurity } from '@/state/security';
import { colors, space } from '@/theme';
import { isEmail } from '@/utils/validation';

function Setting({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.setting}>
      <AppText variant="bodyMedium">{label}</AppText>
      {children}
      {hint ? <AppText variant="small" tone="muted">{hint}</AppText> : null}
    </View>
  );
}

export default function Security() {
  const router = useRouter();
  const back = useBack();
  const { settings, update, checks, met, total } = useSecurity();
  const recoveryInvalid = settings.recoveryEmail.length > 0 && !isEmail(settings.recoveryEmail);
  const groups: CheckGroup[] = ['device', 'sharing', 'records'];

  return (
    <Screen header={<ScreenHeader title="Security" subtitle={`${met} of ${total} checks complete`} onBack={back} />}>
      <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
        <Banner tone="warn" title="Preferences only, for now" body="These choices are saved in memory so you can review the flow. Biometrics, auto-lock and two-step sign-in aren’t active until the app is connected to its backend." />
      </View>

      <SectionHeader title="Sign-in" />
      <Register>
        <ToggleRow title="Two-step sign-in" description="Ask for a second code when you sign in on a new device." value={settings.twoStep} onChange={(v) => update({ twoStep: v })} />
        <ToggleRow title="Biometric unlock" description="Use your fingerprint or face to open the vault." value={settings.biometric} onChange={(v) => update({ biometric: v })} />
        <ToggleRow title="Sign-in alerts" description="Tell me when my account is used on a new device." value={settings.loginAlerts} onChange={(v) => update({ loginAlerts: v })} />
      </Register>

      <SectionHeader title="This device" />
      <Register>
        <Setting label="Lock the vault after">
          <Segmented
            value={String(settings.autoLockMinutes)}
            onChange={(v) => update({ autoLockMinutes: Number(v) })}
            options={[{ value: '1', label: '1 min' }, { value: '5', label: '5 min' }, { value: '15', label: '15 min' }, { value: '0', label: 'Never' }]}
          />
        </Setting>
        <ToggleRow title="Hide previews in app switcher" description="Blank the screen when you switch to another app." value={settings.hidePreviews} onChange={(v) => update({ hidePreviews: v })} />
      </Register>

      <SectionHeader title="Recovery" />
      <View style={styles.setting}>
        <Field
          label="Recovery email" value={settings.recoveryEmail} onChangeText={(v) => update({ recoveryEmail: v })}
          autoCapitalize="none" keyboardType="email-address" placeholder="name@example.com"
          error={recoveryInvalid ? 'Enter a valid email address.' : null} hint="Used to regain access if you lose your device."
        />
      </View>

      <SectionHeader title="Sharing" />
      <Register>
        <Setting label="New shares end after" hint="You can still choose a different end date for each share.">
          <Segmented
            value={String(settings.defaultShareExpiryDays)}
            onChange={(v) => update({ defaultShareExpiryDays: Number(v) })}
            options={[{ value: '1', label: '24 h' }, { value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '0', label: 'Never' }]}
          />
        </Setting>
      </Register>

      <SectionHeader title="All checks" count={total} />
      {groups.map((g) => (
        <View key={g}>
          <AppText variant="label" tone="muted" style={{ paddingHorizontal: space.xl, paddingBottom: space.sm, paddingTop: space.sm }}>{checkGroupTitle[g]}</AppText>
          <Register>
            {checks.filter((c) => c.group === g).map((c) => (
              <Entry
                key={c.id}
                icon={c.met ? 'check-circle' : 'alert-triangle'}
                iconTone={c.met ? 'patina' : 'brass'}
                title={c.label}
                subtitle={c.met ? undefined : c.detail}
                subtitleTone="soft"
                titleLines={2}
                onPress={!c.met && c.href && c.href !== '/security' ? () => router.push(c.href!) : undefined}
              />
            ))}
          </Register>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  setting: { gap: space.sm, padding: space.xl, backgroundColor: colors.folio, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule },
});
