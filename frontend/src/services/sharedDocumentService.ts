import { supabase } from '@/lib/supabase';

export async function getSharedPdf(
  shareId: string,
  mode: 'view' | 'download' = 'view',
): Promise<ArrayBuffer> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error('Please sign in to access this document.');
  }

  const { data: urlData } = await supabase.functions.invoke(
    'personalized-share',
    { body: { action: 'open', shareId, mode } },
  );

  // The function URL is derived from the configured Supabase client.
  // Use the URL/key from your existing frontend environment.
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase client configuration is missing.');
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/personalized-share`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'open', shareId, mode }),
    },
  );

  if (!response.ok) {
    let message = 'Could not open the shared document.';
    try {
      const result = await response.json();
      message = result.error ?? message;
    } catch {
      // Keep the generic error if the server didn't return JSON.
    }
    throw new Error(message);
  }

  return response.arrayBuffer();
}