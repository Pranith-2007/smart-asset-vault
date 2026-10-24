import { useCallback, useEffect, useState } from 'react';
import { Alert,Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { encode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';

import {
  AppText,
  Banner,
  Button,
  Screen,
  ScreenHeader,
  useToast,
} from '@/components';
import { supabase } from '@/lib/supabase';
import { useBack } from '@/hooks/useBack';
import { useVault } from '@/state/vault';
import { space } from '@/theme';
import { formatDate } from '@/utils/format';

export default function SharedDocumentScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const back = useBack();
  const toast = useToast();
  const vault = useVault();

  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshRequested, setRefreshRequested] = useState(false);

  const share = vault.receivedShares?.find((item) => item.id === id) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('The shared document link is missing its ID.');
        setLoading(false);
        return;
      }

      if (share) {
        setLoading(false);
        return;
      }

      try {
        const ok = await vault.refresh();

        if (cancelled) return;

        if (!ok) {
          setError('Could not refresh your shared documents. Please try again.');
          setLoading(false);
          return;
        }

        // React state may not have updated yet. Let the next render check it.
        setRefreshRequested(true);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Unable to load this shared document.',
          );
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, share?.id]);

  useEffect(() => {
    if (share) {
      setLoading(false);
      setError(null);
      setRefreshRequested(false);
    } else if (refreshRequested) {
      setLoading(false);
      setError(
        'This share was not found for your account. It may have expired, been revoked, or been removed.',
      );
      setRefreshRequested(false);
    }
  }, [share, refreshRequested]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRefreshRequested(false);
    void vault.refresh().then((ok) => {
      if (!ok) {
        setError('Could not refresh your shared documents. Please try again.');
        setLoading(false);
      } else {
        setRefreshRequested(true);
      }
    }).catch((e) => {
      setError(e instanceof Error ? e.message : 'Unable to reload this share.');
      setLoading(false);
    });
  }, [vault]);

  
const openPdf = async (mode: 'view' | 'download') => {
  if (!share || opening) return;

  if (mode === 'download' && share.access !== 'download') {
    toast.show('The sender has not allowed downloads.', 'error');
    return;
  }

  setOpening(true);
  setError(null);

  try {
    const { data, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    const session = data.session;
    if (!session?.access_token) {
      throw new Error('Please sign in again to access this document.');
    }

    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase configuration is missing.');
    }

    const response = await fetch(
      `${url}/functions/v1/personalized-share`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'open',
          shareId: share.id,
          mode,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Request failed (${response.status}).`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/pdf')) {
      throw new Error('The server did not return a PDF file.');
    }

    const base64 = encode(await response.arrayBuffer());
    const safeName =
      share.fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\.pdf$/i, '') || 'shared-document';

    const directory = FileSystem.cacheDirectory;
    if (!directory) throw new Error('App cache directory is unavailable.');

    const fileUri = `${directory}${safeName}-${Date.now()}.pdf`;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (mode === 'download') {
  if (Platform.OS === 'android') {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      toast.show('Choose a folder to save the PDF.', 'error');
      return;
    }

    const destination =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `${safeName}.pdf`,
        'application/pdf',
      );

    const pdfBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await FileSystem.writeAsStringAsync(destination, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    toast.show('PDF saved successfully.', 'success');
  } else {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Saving PDF is unavailable on this device.');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save PDF',
      UTI: 'com.adobe.pdf',
    });
  }
} else {
      // Open the PDF inside Smart Asset Vault.
      router.push({
        pathname: '/shared/pdf-viewer',
        params: {
          uri: fileUri,
          title: share.documentTitle,
        },
      });
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Unable to access this document.';

    setError(message);
    Alert.alert('Could not access document', message);
  } finally {
    setOpening(false);
  }
};


  return (
    <Screen
      header={
        <ScreenHeader
          title={share?.documentTitle ?? 'Shared document'}
          subtitle="Shared with you"
          onBack={back}
        />
      }
    >
      <View
        style={{
          paddingHorizontal: space.xl,
          paddingVertical: space.lg,
          gap: space.md,
        }}
      >
        {loading ? (
          <AppText tone="muted">Loading shared document…</AppText>
        ) : !share ? (
          <>
            <Banner
              tone="bad"
              title="Unable to load this share"
              body={error ?? 'This share is unavailable.'}
            />
            <Button title="Try again" icon="refresh-cw" onPress={retry} />
          </>
        ) : (
          <>
            <AppText variant="headline">{share.documentTitle}</AppText>
            <AppText tone="muted">File: {share.fileName}</AppText>

            <AppText tone="muted">
              Permission: {share.access === 'download' ? 'View and download' : 'View only'}
            </AppText>

            <AppText tone="muted">
              {share.expiresOn
                ? `Access expires: ${formatDate(share.expiresOn)}`
                : 'No expiry date'}
            </AppText>

            {error ? (
              <Banner tone="bad" title="Could not open PDF" body={error} />
            ) : null}

            <Button
              title={opening ? 'Opening…' : 'Open PDF'}
              icon="file-text"
              onPress={() => void openPdf('view')}
              disabled={opening}
            />

            {share.access === 'download' ? (
              <Button
                title={opening ? 'Preparing…' : 'Download PDF'}
                icon="download"
                variant="secondary"
                onPress={() => void openPdf('download')}
                disabled={opening}
              />
            ) : null}

            <AppText variant="small" tone="muted">
              The server checks your access whenever you request the PDF.
              Android will show a chooser for compatible PDF or file apps.
            </AppText>
          </>
        )}
      </View>
    </Screen>
  );
}
