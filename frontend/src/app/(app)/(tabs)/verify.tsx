
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppText, Button, Screen, ScreenHeader, Banner } from '@/components';
import { colors, space } from '@/theme';
import { verifyAnyDocument } from '@/services/blockchainService';

export default function VerifyScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'match_found' | 'no_match' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!picked.canceled && picked.assets[0]) {
      setFile(picked.assets[0]);
      setResult(null);
      setError(null);
    }
  };

  const verifyFile = async () => {
    if (!file || verifying) return;

    setVerifying(true);
    setResult(null);
    setError(null);

    try {
      const verification = await verifyAnyDocument(file.uri);
      setResult(verification.status === 'match_found' ? 'match_found' : 'no_match');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification is unavailable.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Screen header={<ScreenHeader title="Verify Document" subtitle="Check a file against blockchain records" />}>
      <View style={styles.content}>
        <AppText variant="small" tone="muted">
          Choose a PDF or image you received. Verification does not register or upload it to your vault.
        </AppText>

        <Button
          title={file ? 'Choose another file' : 'Choose document'}
          icon="file-text"
          onPress={() => void pickFile()}
        />

        {file ? (
          <View style={styles.file}>
            <AppText>{file.name}</AppText>
            <AppText variant="small" tone="muted">
              {(file.size ?? 0).toLocaleString()} bytes
            </AppText>
            <Button
              title={verifying ? 'Verifying...' : 'Verify Document'}
              icon="shield"
              onPress={() => void verifyFile()}
              disabled={verifying}
            />
          </View>
        ) : null}

        {result === 'match_found' ? (
          <Banner tone="good" title="Verified" body="This file matches a document hash registered on the blockchain." />
        ) : null}

        {result === 'no_match' ? (
<Banner
  tone="warn"
  title="Document Not Found"
  body="This document was not found in the blockchain database."
/>        ) : null}

        {error ? (
          <Banner tone="bad" title="Verification Unavailable" body={error} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.xl,
    gap: space.lg,
  },
  file: {
    gap: space.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 12,
  },
});
