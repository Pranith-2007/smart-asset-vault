import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Banner, Button, Chips, Field, Icon, Screen, ScreenHeader, Segmented, useDetailGuard } from '@/components';
import { accessLabel } from '@/domain/labels';
import { isActiveShare } from '@/domain/selectors';
import type { AccessLevel } from '@/domain/types';
import { useBack } from '@/hooks/useBack';
import { useSecurity } from '@/state/security';
import { useVault, repositoryMessage } from '@/state/vault';
import { colors, radius, space } from '@/theme';
import { daysAhead } from '@/utils/date';
import { formatDate } from '@/utils/format';
import { isEmail } from '@/utils/validation';

const expiryOptions = [
  { value: '1', label: '24 hours' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '0', label: 'No expiry' },
];

export default function ShareDocument() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const back = useBack();
  const vault = useVault();
  const { settings } = useSecurity();
  const doc = vault.documents.find((d) => d.id === id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<AccessLevel>('view');
  const [days, setDays] = useState(String(settings.defaultShareExpiryDays));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; expiresOn: string | null; access: AccessLevel } | null>(null);

  const guard = useDetailGuard('Share document', !!doc, 'document');
  if (guard || !doc) return guard;

  const n = Number(days);
  const expiresOn = n > 0 ? daysAhead(n) : null;

  const submit = async () => {
    const dupe = vault.shares.find((s) => s.documentId === doc.id && isActiveShare(s) && s.recipientEmail.toLowerCase() === email.trim().toLowerCase());
    const next = {
      name: name.trim().length < 2 ? 'Enter the person or organisation’s name.' : undefined,
      email: !isEmail(email) ? 'Enter a valid email address.' : dupe ? `${dupe.recipientName} already has access. Change their access instead.` : undefined,
    };
    setErrors(next);
    setSaveError(null);
    if (Object.values(next).some(Boolean)) return;
    setSaving(true);
    try {
      await vault.createShare({ documentId: doc.id, recipientName: name.trim(), recipientEmail: email.trim(), access, expiresOn, note: note.trim() || undefined });
      setCreated({ name: name.trim(), expiresOn, access });
    } catch (e) {
      setSaveError(repositoryMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <Screen
        header={<ScreenHeader title="Share recorded" />}
        footer={
          <>
            <Button title="View permissions" onPress={() => router.replace(`/document/${doc.id}/permissions`)} />
            <Button title="Done" variant="quiet" compact onPress={() => router.replace(`/document/${doc.id}`)} />
          </>
        }
      >
        <View style={{ paddingHorizontal: space.xl, gap: space.xl }}>
          <View style={{ width: 48, height: 48, borderRadius: radius.field, backgroundColor: colors.patinaTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={24} color={colors.patina} />
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="heading">{created.name} now has access</AppText>
            <AppText tone="soft">
              {accessLabel[created.access]} to “{doc.title}”, {created.expiresOn ? `until ${formatDate(created.expiresOn)}` : 'with no expiry'}. You can change or revoke this at any time from the Access tab.
            </AppText>
          </View>
          <Banner tone="info" title="Recorded in the preview only" body="No message was sent. Delivery to the recipient starts once the backend is connected." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title="Share document" subtitle={doc.title} onBack={back} />}
      footer={
        <>
          <AppText variant="small" tone="muted" style={{ textAlign: 'center' }}>
            {accessLabel[access]}, {expiresOn ? `until ${formatDate(expiresOn)}` : 'with no expiry'}
          </AppText>
          <Button title="Create share" icon="send" onPress={submit} loading={saving} />
        </>
      }
    >
      <View style={{ paddingHorizontal: space.xl, gap: space.xl }}>
        {saveError ? <Banner tone="bad" title="Couldn’t create the share" body={saveError} /> : null}
        <Field label="Recipient name" value={name} onChangeText={setName} error={errors.name} placeholder="Priya Menon" autoCapitalize="words" />
        <Field label="Recipient email" value={email} onChangeText={setEmail} error={errors.email} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" />
        <View style={{ gap: 6 }}>
          <AppText variant="label" tone="soft">What they can do</AppText>
          <Segmented value={access} onChange={setAccess} options={[{ value: 'view', label: 'View only' }, { value: 'download', label: 'View and download' }]} />
          <AppText variant="small" tone="muted">{access === 'view' ? 'They can open the document but not save a copy.' : 'They can open the document and save a copy.'}</AppText>
        </View>
        <View style={{ gap: 6 }}>
          <AppText variant="label" tone="soft">Access ends</AppText>
          <Chips wrap value={days} onChange={setDays} options={expiryOptions} />
        </View>
        {n === 0 ? <Banner tone="warn" title="Open-ended access" body="With no expiry, this person keeps access until you revoke it. A short expiry is safer." /> : null}
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline placeholder="Why you’re sharing this" />
      </View>
    </Screen>
  );
}
