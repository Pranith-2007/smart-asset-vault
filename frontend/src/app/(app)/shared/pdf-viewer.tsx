
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';

export default function SharedPdfViewerScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    title: string;
  }>();

  const uri = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const title = Array.isArray(params.title) ? params.title[0] : params.title;

  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        if (!uri) throw new Error('PDF file path is missing.');

        const base64 = await fetch(uri)
  .then(async (response) => {
    if (!response.ok) {
      throw new Error('Could not read the cached PDF file.');
    }

    return response.arrayBuffer();
  })
  .then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  });

        const safeTitle = (title || 'Shared document')
          .replace(/[<>&"]/g, '');

        const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; background: #202124; color: white; font-family: sans-serif; }
  #toolbar { position: sticky; top: 0; padding: 12px; background: #303134;
    display: flex; justify-content: center; align-items: center; gap: 16px; z-index: 2; }
  button { padding: 8px 12px; border: 0; border-radius: 6px; }
  #pages { padding: 12px; }
  canvas { display: block; max-width: 100%; height: auto; margin: 0 auto 14px;
    background: white; }
  #status { text-align: center; padding: 20px; }
</style>
</head>
<body>
<div id="toolbar">
  <button id="prev">Previous</button>
  <span id="pageInfo">Loading PDF…</span>
  <button id="next">Next</button>
</div>
<div id="status">Preparing document…</div>
<div id="pages"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
(async function() {
  const encoded = ${JSON.stringify(base64)};
  const status = document.getElementById('status');
  const pages = document.getElementById('pages');
  const pageInfo = document.getElementById('pageInfo');
  let pdf;
  let currentPage = 1;
  let rendering = false;

  try {
    if (!window.pdfjsLib) throw new Error('PDF renderer could not load.');

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    status.textContent = '';
    await renderPage(1);
  } catch (e) {
    status.textContent = 'Unable to display PDF: ' + (e.message || 'Unknown error');
  }

  async function renderPage(number) {
    if (!pdf || rendering) return;
    rendering = true;
    currentPage = Math.max(1, Math.min(number, pdf.numPages));
    pageInfo.textContent = currentPage + ' / ' + pdf.numPages;
    pages.innerHTML = '';

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pages.appendChild(canvas);
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (e) {
      status.textContent = 'Could not render this page.';
    } finally {
      rendering = false;
    }
  }

  document.getElementById('prev').onclick = () => renderPage(currentPage - 1);
  document.getElementById('next').onclick = () => renderPage(currentPage + 1);
})();
</script>
</body>
</html>`;

        if (!cancelled) setHtml(viewerHtml);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load this PDF.');
        }
      }
    }

    void loadPdf();
    return () => {
      cancelled = true;
    };
  }, [uri, title]);

  return (
    <View style={{ flex: 1, backgroundColor: '#202124' }}>
      <View
        style={{
          padding: 14,
          paddingTop: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: '#303134',
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={{ color: 'white', fontSize: 16 }}>‹ Back</Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={{ color: 'white', fontSize: 16, flex: 1 }}
        >
          {title || 'Shared document'}
        </Text>
      </View>

      {error ? (
        <Text style={{ color: 'white', padding: 20 }}>{error}</Text>
      ) : !html ? (
        <ActivityIndicator color="white" style={{ flex: 1 }} />
      ) : (
        <WebView
          source={{ html }}
          originWhitelist={['*']}
          javaScriptEnabled
          style={{ flex: 1, backgroundColor: '#202124' }}
        />
      )}
    </View>
  );
}
