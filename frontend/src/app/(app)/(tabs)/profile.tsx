import { View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { AppText, Avatar, Banner, Button, Entry, KeyValue, Register, Screen, ScreenHeader, SectionHeader, Segmented, Tag, useToast } from '@/components';
import type { PreviewDataMode } from '@/data/mock/mockRepository';
import { useSecurity } from '@/state/security';
import { useSession } from '@/state/session';
import { space } from '@/theme';
import { formatDate } from '@/utils/format';

const modeHelp: Record<PreviewDataMode, string> = {
  normal: 'Fictional records, as a typical account would look.',
  empty: 'A brand-new account with nothing in it. Review every empty state.',
  error: 'Loading and saving fail, so you can review every error state.',
};

export default function Profile() {
  const router = useRouter();
  const toast = useToast();
  const { user, exitPreview, dataMode, setDataMode, resetSampleData } = useSession();
  const { met, total } = useSecurity();

  return (
    <Screen header={<ScreenHeader title="Profile" />} padBottom={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.xl, paddingBottom: space.xl }}>
        <Avatar name={user.name} size={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">{user.name}</AppText>
          <AppText variant="small" tone="muted">{user.email}</AppText>
          <Tag label="Preview account" />
        </View>
      </View>

      <Register>
        <Entry icon="lock" title="Security settings" subtitle={`${met} of ${total} checks complete`} onPress={() => router.push('/security')} />
        <Entry title="Member since" meta={formatDate(user.memberSince)} />
      </Register>

      <SectionHeader title="Preview tools" />
      <View style={{ paddingHorizontal: space.xl, gap: space.md }}>
        <Banner tone="info" title="You’re using sample data" body="Changes you make are kept in memory and reset when the app restarts." />
        <AppText variant="label" tone="soft">Show the app as</AppText>
        <Segmented
          value={dataMode}
          onChange={(m) => setDataMode(m)}
          options={[{ value: 'normal', label: 'Normal' }, { value: 'empty', label: 'Empty' }, { value: 'error', label: 'Errors' }]}
        />
        <AppText variant="small" tone="muted">{modeHelp[dataMode]}</AppText>
        <Button title="Reset sample data" variant="secondary" compact icon="rotate-ccw" onPress={() => { resetSampleData(); toast.show('Sample data reset'); }} />
      </View>

      <SectionHeader title="About this build" />
      <Register>
        <KeyValue label="Version" value={Constants.expoConfig?.version ?? '0.1.0'} />
        <KeyValue label="Accounts" value="Not connected" />
        <KeyValue label="Storage" value="Not connected" last />
      </Register>

      <View style={{ padding: space.xl }}>
        <Button title="Exit preview" variant="danger" icon="log-out" onPress={() => { exitPreview(); router.replace('/login'); }} />
      </View>
    </Screen>
  );
}
