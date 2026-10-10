import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, EmptyState, Entry, Register, Screen, ScreenHeader, SectionHeader, Tag, useDetailGuard } from '@/components';
import { accessLabel } from '@/domain/labels';
import { shareState, sharesForDocument } from '@/domain/selectors';
import { useBack } from '@/hooks/useBack';
import { useVault } from '@/state/vault';
import { space } from '@/theme';
import { expiryLabel, formatDate } from '@/utils/format';

export default function Permissions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const back = useBack();
  const vault = useVault();
  const doc = vault.documents.find((d) => d.id === id);
  const guard = useDetailGuard('Permissions', !!doc, 'document');
  if (guard || !doc) return guard;

  const all = sharesForDocument(vault, doc.id);
  const active = all.filter((s) => shareState(s) === 'active');
  const ended = all.filter((s) => shareState(s) !== 'active');

  return (
    <Screen
      header={<ScreenHeader title="Permissions" subtitle={doc.title} onBack={back} />}
      footer={<Button title="Share with someone" icon="send" onPress={() => router.push(`/document/${doc.id}/share`)} />}
    >
      <Register>
        <Entry icon="user" title="You" subtitle="Owner, full access" chevron={false} />
      </Register>

      {all.length === 0 ? (
        <EmptyState icon="lock" title="Not shared with anyone" body="Only you can open this document. Share it with someone and choose how long they keep access." />
      ) : (
        <>
          <SectionHeader title="Has access" count={active.length} />
          {active.length === 0 ? (
            <AppText variant="small" tone="muted" style={{ paddingHorizontal: space.xl }}>No one has access right now.</AppText>
          ) : (
            <Register>
              {active.map((s) => (
                <Entry
                  key={s.id}
                  icon="users"
                  title={s.recipientName}
                  subtitle={s.recipientEmail}
                  metaSub={
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Tag label={accessLabel[s.access]} />
                      {s.expiresOn ? <AppText variant="caption" tone="muted">{expiryLabel(s.expiresOn)}</AppText> : <Tag label="No expiry" tone="warn" />}
                    </View>
                  }
                  onPress={() => router.push(`/share/${s.id}`)}
                />
              ))}
            </Register>
          )}

          {ended.length ? (
            <>
              <SectionHeader title="Ended" count={ended.length} />
              <Register>
                {ended.map((s) => (
                  <Entry
                    key={s.id}
                    icon={shareState(s) === 'revoked' ? 'slash' : 'clock'}
                    iconTone={shareState(s) === 'revoked' ? 'brick' : 'patina'}
                    title={s.recipientName}
                    subtitle={shareState(s) === 'revoked' ? `Revoked ${formatDate(s.revokedOn!)}` : `Expired ${formatDate(s.expiresOn!)}`}
                    onPress={() => router.push(`/share/${s.id}`)}
                  />
                ))}
              </Register>
            </>
          ) : null}
        </>
      )}
      <AppText variant="small" tone="muted" style={{ padding: space.xl }}>
        View only people can open the document. View and download people can also save a copy.
      </AppText>
    </Screen>
  );
}
