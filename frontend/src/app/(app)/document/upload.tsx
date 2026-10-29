import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText, Banner, Button, Chips, DateField, Entry, Field, Icon, OptionSheet, Register, Screen, ScreenHeader, ToggleRow, useToast,
} from '@/components';
import { kindMeta } from '@/domain/labels';
import type { DocumentKind } from '@/domain/types';
import { useBack } from '@/hooks/useBack';
import { useVault, repositoryMessage } from '@/state/vault';
import { colors, radius, space } from '@/theme';
import { daysAhead } from '@/utils/date';
import { formatBytes } from '@/utils/format';

const MAX_BYTES = 25 * 1024 * 1024;
interface Picked { uri: string; name: string; size: number; mimeType: string }

const titleFromFile = (name: string) => {
  const t = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export default function UploadDocument() {
  const { assetId: presetAsset } = useLocalSearchParams<{ assetId?: string }>();
  const router = useRouter();
  const back = useBack();
  const toast = useToast();
  const { assets, addDocument } = useVault();

  const [picked, setPicked] = useState<Picked | null>(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<DocumentKind>('ownership');
  const [assetId, setAssetId] = useState<string | null>(presetAsset ?? null);
  const [sheet, setSheet] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresOn, setExpiresOn] = useState<Date | null>(null);
  const [certified, setCertified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const pick = async () => {
    setErrors((e) => ({ ...e, file: undefined }));
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
      if (res.canceled) return;
      const f = res.assets[0];
      console.log('PICKED FILE:', {
      uri: f.uri,
      name: f.name,
      size: f.size,
});
      if ((f.size ?? 0) > MAX_BYTES) {
        setErrors((e) => ({ ...e, file: 'That file is larger than 25 MB. Choose a smaller one.' }));
        return;
      }
      setPicked({ uri: f.uri, name: f.name, size: f.size ?? 0, mimeType: f.mimeType ?? 'application/octet-stream' });
      if (!title.trim()) setTitle(titleFromFile(f.name));
    } catch {
      setErrors((e) => ({ ...e, file: 'Couldn’t open that file. Try choosing it again.' }));
    }
  };

  const submit = async () => {
    const next = {
      file: picked ? undefined : 'Choose a file to add.',
      title: title.trim().length < 2 ? 'Give the document a title.' : undefined,
      expiry: hasExpiry && !expiresOn ? 'Choose the expiry date.' : undefined,
    };
    setErrors(next);
    setSaveError(null);
    if (Object.values(next).some(Boolean) || !picked) return;
    setSaving(true);
    try {
      const id = await addDocument({
        title: title.trim(), kind, assetId, fileName: picked.name, mimeType: picked.mimeType, sizeBytes: picked.size,
        expiresOn: hasExpiry && expiresOn ? expiresOn.toISOString() : null, certifiedCopy: certified, localUri: picked.uri,
      });
      toast.show('Document added');
      router.replace(`/document/${id}`);
    } catch (e) {
      setSaveError(repositoryMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const linked = assets.find((a) => a.id === assetId);

  return (
    <Screen
      header={<ScreenHeader title="Add a document" onBack={back} />}
      footer={<Button title="Add to vault" onPress={submit} loading={saving} />}
    >
      <View style={{ gap: space.xl }}>
        <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
          {saveError ? <Banner tone="bad" title="Couldn’t add the document" body={saveError} /> : null}
          <AppText variant="label" tone="soft">File</AppText>
          {picked ? null : (
            <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Choose a file" android_ripple={{ color: colors.patinaTint }} style={[styles.drop, errors.file ? { borderColor: colors.brick } : null]}>
              <Icon name="upload" size={22} color={colors.patina} />
              <AppText variant="bodyMedium" tone="patina">Choose a file</AppText>
              <AppText variant="small" tone="muted">PDF or image, up to 25 MB</AppText>
            </Pressable>
          )}
          {errors.file ? (
            <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLiveRegion="polite">
              <Icon name="alert-circle" size={14} color={colors.brick} />
              <AppText variant="small" tone="brick" style={{ flex: 1 }}>{errors.file}</AppText>
            </View>
          ) : null}
        </View>
        {picked ? (
          <Register>
            <Entry
              icon={picked.mimeType.startsWith('image/') ? 'image' : 'file-text'}
              title={picked.name}
              subtitle={formatBytes(picked.size)}
              trailing={<Button title="Replace" variant="quiet" compact onPress={pick} />}
            />
          </Register>
        ) : null}

        <View style={{ paddingHorizontal: space.xl, gap: space.xl }}>
          <Field label="Title" value={title} onChangeText={setTitle} error={errors.title} placeholder="Sale deed, Flat 4B" autoCapitalize="sentences" />
          <View style={{ gap: 6 }}>
            <AppText variant="label" tone="soft">Type</AppText>
            <Chips wrap value={kind} onChange={setKind} options={(Object.keys(kindMeta) as DocumentKind[]).map((k) => ({ value: k, label: kindMeta[k].label }))} />
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="label" tone="soft">Linked asset</AppText>
            <Pressable onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Linked asset, ${linked?.name ?? 'none'}`} style={styles.select}>
              <AppText style={{ flex: 1 }} tone={linked ? 'ink' : 'muted'}>{linked ? linked.name : 'Not linked to an asset'}</AppText>
              <Icon name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <Register>
          <ToggleRow title="Has an expiry date" description="Policies and identity papers expire. You’ll see a flag before they do." value={hasExpiry} onChange={setHasExpiry} />
          {hasExpiry ? (
            <View style={{ padding: space.xl, backgroundColor: colors.folio, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule }}>
              <DateField label="Expires on" value={expiresOn} onChange={setExpiresOn} error={errors.expiry} minimumDate={new Date()} maximumDate={new Date(daysAhead(365 * 30))} />
            </View>
          ) : null}
          <ToggleRow title="Certified copy" description="Mark this as the original or a certified copy. It’s your label and isn’t verified." value={certified} onChange={setCertified} />
        </Register>

        <View style={{ paddingHorizontal: space.xl }}>
          <Banner tone="info" title="Stays on this device in the preview" body="Encrypted storage arrives with the backend. Until then the file isn’t uploaded anywhere." />
        </View>
      </View>

      <OptionSheet
        visible={sheet}
        title="Link to an asset"
        selected={assetId ?? 'none'}
        onClose={() => setSheet(false)}
        onSelect={(v) => setAssetId(v === 'none' ? null : v)}
        options={[{ value: 'none', label: 'Not linked to an asset' }, ...assets.map((a) => ({ value: a.id, label: a.name, sublabel: a.folio }))]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  drop: { alignItems: 'center', gap: 6, paddingVertical: space.x3, borderRadius: radius.panel, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.patina, backgroundColor: colors.folio },
  select: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 14, borderRadius: radius.field, borderWidth: 1.5, borderColor: colors.ruleStrong, backgroundColor: colors.folio },
});
