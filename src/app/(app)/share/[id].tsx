import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText, Banner, Button, Chips, ConfirmSheet, Entry, KeyValue, Register, Screen, ScreenHeader, SectionHeader, Segmented, Tag, useDetailGuard, useToast,
} from '@/components';
import { accessLabel, activityIcon, kindMeta } from '@/domain/labels';
import { shareState } from '@/domain/selectors';
import type { AccessLevel } from '@/domain/types';
import { useBack } from '@/hooks/useBack';
import { useVault, repositoryMessage } from '@/state/vault';
import { space } from '@/theme';
import { daysAhead } from '@/utils/date';
import { expiryLabel, formatDate, timeAgo } from '@/utils/format';

const expiryOptions = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '0', label: 'No expiry' },
];

export default function ShareDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const back = useBack();
  const toast = useToast();
  const vault = useVault();
  const share = vault.shares.find((s) => s.id === id);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const guard = useDetailGuard('Share', !!share, 'share');
  if (guard || !share) return guard;

  const doc = vault.documents.find((d) => d.id === share.documentId);
  const state = shareState(share);
  const events = vault.activity.filter((e) => e.shareId === share.id);

  const change = async (patch: { access?: AccessLevel; expiresOn?: string | null }, message: string) => {
    setBusy(true);
    try {
      await vault.updateShare(share.id, patch);
      toast.show(message);
    } catch (e) {
      toast.show(repositoryMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setRevoking(true);
    setRevokeError(null);
    try {
      await vault.revokeShare(share.id);
      setConfirm(false);
      toast.show('Access revoked');
    } catch (e) {
      setRevokeError(repositoryMessage(e));
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={share.recipientName} subtitle={share.recipientEmail} onBack={back} />}
      footer={
        state === 'active'
          ? <Button title="Revoke access" variant="danger" icon="slash" onPress={() => { setRevokeError(null); setConfirm(true); }} />
          : <Button title="Share again" icon="send" variant="secondary" onPress={() => router.push(`/document/${share.documentId}/share`)} />
      }
    >
      <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg, gap: space.md }}>
        <Tag label={state === 'active' ? 'Active' : state === 'revoked' ? 'Revoked' : 'Expired'} tone={state === 'active' ? 'good' : state === 'revoked' ? 'bad' : 'warn'} />
        {state === 'revoked' ? <Banner tone="bad" title={`Access revoked on ${formatDate(share.revokedOn!)}`} body="This person no longer has access. You can share the document again at any time." /> : null}
        {state === 'expired' ? <Banner tone="warn" title={`Access expired on ${formatDate(share.expiresOn!)}`} body="This share ended on its own. Share again if they still need the document." /> : null}
        {state === 'active' && !share.expiresOn ? <Banner tone="warn" title="This share has no expiry" body="Set an expiry below so access ends on its own." /> : null}
      </View>

      {doc ? (
        <Register>
          <Entry icon={kindMeta[doc.kind].icon} title={doc.title} subtitle="Shared document" onPress={() => router.push(`/document/${doc.id}`)} />
        </Register>
      ) : null}

      <SectionHeader title="What they can do" />
      {state === 'active' ? (
        <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
          <Segmented value={share.access} onChange={(a) => !busy && a !== share.access && change({ access: a }, 'Access updated')} options={[{ value: 'view', label: 'View only' }, { value: 'download', label: 'View and download' }]} />
          <AppText variant="small" tone="muted">Changes apply straight away.</AppText>
        </View>
      ) : (
        <Register><KeyValue label="Access" value={accessLabel[share.access]} last /></Register>
      )}

      <SectionHeader title="Expiry" />
      <Register>
        <KeyValue label="Created" value={formatDate(share.createdOn)} />
        <KeyValue label="Access ends" value={share.expiresOn ? `${formatDate(share.expiresOn)}` : 'Never'} />
        <KeyValue label="Status" value={state === 'active' ? expiryLabel(share.expiresOn) : state === 'revoked' ? 'Revoked' : 'Expired'} last />
      </Register>
      {state === 'active' ? (
        <View style={{ paddingTop: space.md, gap: 6 }}>
          <AppText variant="small" tone="muted" style={{ paddingHorizontal: space.xl }}>Set a new end date, counted from today.</AppText>
          <Chips
            value="__none"
            onChange={(v) => !busy && change({ expiresOn: Number(v) > 0 ? daysAhead(Number(v)) : null }, Number(v) > 0 ? 'Expiry updated' : 'Expiry removed')}
            options={expiryOptions}
          />
        </View>
      ) : null}

      <SectionHeader title="Activity" />
      <Register>
        <KeyValue label="Opened" value={share.views === 0 ? 'Not yet' : `${share.views} ${share.views === 1 ? 'time' : 'times'}`} />
        <KeyValue label="Last opened" value={share.lastAccessedOn ? timeAgo(share.lastAccessedOn) : 'Never'} last />
      </Register>
      {events.length ? (
        <>
          <View style={{ height: space.md }} />
          <Register>
            {events.map((e) => <Entry key={e.id} icon={activityIcon[e.kind]} iconTone={e.kind === 'revoked' ? 'brick' : 'patina'} title={e.summary} titleLines={2} subtitle={timeAgo(e.at)} />)}
          </Register>
        </>
      ) : null}

      <ConfirmSheet
        visible={confirm}
        danger
        title={`Revoke ${share.recipientName}’s access?`}
        body={`They will lose access to “${doc?.title ?? 'this document'}”. You can share it with them again later.`}
        confirmLabel="Revoke access"
        loading={revoking}
        error={revokeError}
        onConfirm={revoke}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
