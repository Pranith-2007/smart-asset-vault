import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Banner, Button, Entry, Icon, KeyValue, Register, Screen, ScreenHeader, SectionHeader, useDetailGuard } from '@/components';
import { accessLabel, categoryMeta, kindMeta } from '@/domain/labels';
import { isActiveShare, sharesForDocument } from '@/domain/selectors';
import { useBack } from '@/hooks/useBack';
import { useVault } from '@/state/vault';
import { colors, radius, space } from '@/theme';
import { daysUntil } from '@/utils/date';
import { expiryLabel, formatBytes, formatDate } from '@/utils/format';

function PagePlaceholder({ certified }: { certified: boolean }) {
  const lines = [0.9, 0.78, 0.86, 0.5, 0.82, 0.7, 0.88, 0.4];
  return (
    <View style={styles.page}>
      <View style={[styles.line, { width: '55%', height: 14, backgroundColor: colors.ruleStrong, marginBottom: 6 }]} />
      {lines.map((w, i) => <View key={i} style={[styles.line, { width: `${w * 100}%` }]} />)}
      {certified ? (
        <View style={styles.seal} accessibilityLabel="Certified copy">
          <Icon name="award" size={22} color={colors.brass} />
        </View>
      ) : null}
    </View>
  );
}

function PdfPreview({ uri }: { uri: string }) {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={uri}
        title="PDF document preview"
        style={{
          width: '100%',
          height: '70vh',
          border: 'none',
          background: '#fff',
        }}
      />
    );
  }

  return null;
}


export default function DocumentPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const back = useBack();
  const vault = useVault();
  const doc = vault.documents.find((d) => d.id === id);

  const [deleting, setDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const guard = useDetailGuard('Document', !!doc, 'document');

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setImageUrl(null);
      setImageError(false);

      if (
        !doc ||
        (!doc.mimeType.startsWith('image/') &&
          doc.mimeType !== 'application/pdf')
      ) {
        return;
      }

      const { data: metadata, error: metadataError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', doc.id)
        .single();

      if (metadataError || !metadata?.storage_path) {
        if (!cancelled) setImageError(true);
        return;
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(metadata.storage_path, 300);

      if (cancelled) return;

      if (error || !data?.signedUrl) {
        setImageError(true);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [doc?.id, doc?.mimeType]);

 
const performDelete = async () => {
  if (!doc) return;

  try {
    setDeleting(true);
    await vault.deleteDocument(doc.id);
    router.replace('/(app)/(tabs)/documents');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Please try again.';

    if (Platform.OS === 'web') {
      window.alert(`Delete failed: ${message}`);
    } else {
      Alert.alert('Delete failed', message);
    }
  } finally {
    setDeleting(false);
  }
};

const handleDelete = () => {
  if (!doc || deleting) return;

  if (Platform.OS === 'web') {
    if (window.confirm('Permanently delete this document?')) {
      void performDelete();
    }
    return;
  }

  Alert.alert(
    'Delete document?',
    'This permanently removes the document from your vault.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void performDelete(),
      },
    ],
  );
};


  if (guard || !doc) return guard;

  const asset = vault.assets.find((a) => a.id === doc.assetId);
  const active = sharesForDocument(vault, doc.id).filter(isActiveShare);
  const left = doc.expiresOn ? daysUntil(doc.expiresOn) : null;
  const isImage = doc.mimeType.startsWith('image/');


  return (
    <Screen
      header={<ScreenHeader title={doc.title} subtitle={`${kindMeta[doc.kind].label}, version ${doc.version}`} onBack={back} />}
      footer={
  <>
    <Button
      title="Share document"
      icon="send"
      onPress={() => router.push(`/document/${doc.id}/share`)}
    />
    <Button
      title="Manage permissions"
      variant="quiet"
      compact
      onPress={() => router.push(`/document/${doc.id}/permissions`)}
    />
    <Button
      title={deleting ? 'Deleting...' : 'Delete document'}
      icon="trash-2"
      variant="quiet"
      onPress={handleDelete}
      disabled={deleting}
    />
  </>
}
    >
      {left !== null && left < 0 ? (
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
          <Banner tone="bad" title="This document has expired" body={`It expired on ${formatDate(doc.expiresOn!)}. Add a renewed copy to keep your records current.`} />
        </View>
      ) : left !== null && left <= 60 ? (
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
          <Banner tone="warn" title={expiryLabel(doc.expiresOn)} body={`It expires on ${formatDate(doc.expiresOn!)}. Add a renewed copy before then.`} />
        </View>
      ) : null}

      <View style={styles.stage}>
  
{isImage && imageUrl ? (
  <Image
    source={{ uri: imageUrl }}
    style={styles.image}
    resizeMode="contain"
    accessibilityLabel={`Preview of ${doc.title}`}
  />
) : doc.mimeType === 'application/pdf' && imageUrl ? (
  <PdfPreview uri={imageUrl} />
) : (
  <PagePlaceholder certified={doc.certifiedCopy} />
)}


{doc.mimeType === 'application/pdf' && imageUrl ? (
  <Button
    title="Open PDF"
    icon="file-text"
    onPress={() => {
      void import('expo-web-browser').then(({ openBrowserAsync }) =>
        openBrowserAsync(imageUrl)
      );
    }}
  />
) : null}

        <AppText variant="small" tone="muted" style={{ textAlign: 'center', paddingHorizontal: space.xl }}>
          {isImage
            ? 'Showing the image held on this device.'
            : doc.localUri
              ? 'PDF preview isn’t available in this build. The file is held on this device.'
              : 'Sample page. Real document preview arrives with storage.'}
        </AppText>
      </View>

      <SectionHeader title="Details" />
      <Register>
        <KeyValue label="Type" value={kindMeta[doc.kind].label} />
        <KeyValue label="File" value={doc.fileName} />
        <KeyValue label="Size" value={formatBytes(doc.sizeBytes)} />
        <KeyValue label="Added" value={formatDate(doc.addedOn)} />
        <KeyValue label="Expiry" value={doc.expiresOn ? formatDate(doc.expiresOn) : 'None'} />
        <KeyValue label="Certified copy" value={doc.certifiedCopy ? 'Yes, marked by you' : 'No'} last />
      </Register>

      {asset ? (
        <>
          <SectionHeader title="Linked asset" />
          <Register>
            <Entry icon={categoryMeta[asset.category].icon} title={asset.name} subtitle={asset.folio} onPress={() => router.push(`/asset/${asset.id}`)} />
          </Register>
        </>
      ) : null}

      <SectionHeader title="Who can open it" count={active.length} />
      <Register>
        <Entry icon="user" title="You" subtitle="Owner" chevron={false} />
        {active.map((s) => (
          <Entry key={s.id} icon="users" title={s.recipientName} subtitle={`${accessLabel[s.access]}, ${expiryLabel(s.expiresOn).toLowerCase()}`} onPress={() => router.push(`/share/${s.id}`)} />
        ))}
      </Register>
      {active.length === 0 ? <AppText variant="small" tone="muted" style={{ padding: space.xl }}>Only you can open this document.</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', gap: space.md, paddingVertical: space.xl, backgroundColor: colors.paper },
  page: { width: '62%', aspectRatio: 0.74, backgroundColor: colors.folio, borderWidth: 1, borderColor: colors.rule, borderRadius: 3, padding: space.xl, gap: 10, overflow: 'hidden' },
  line: { height: 8, borderRadius: 2, backgroundColor: colors.rule },
  seal: { position: 'absolute', right: 16, bottom: 16, width: 48, height: 48, borderRadius: radius.round, borderWidth: 1.5, borderColor: colors.brass, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brassTint },
  image: { width: '86%', height: 340, backgroundColor: colors.folio },
});
