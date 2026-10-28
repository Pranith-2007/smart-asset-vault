
import { supabase } from "@/lib/supabase";

const BLOCKCHAIN_API_URL =
  process.env.EXPO_PUBLIC_BLOCKCHAIN_API_URL ??
  "http://localhost:3001";

export type BlockchainRegistration = {
  documentId: string;
  contentHash: string;
  transactionHash: string;
  blockNumber: string;
  network: string;
  status: string;
};

export async function registerDocumentHash(
  fileBytes: ArrayBuffer
): Promise<BlockchainRegistration> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Please sign in before registering a document.");
  }

  const response = await fetch(
    `${BLOCKCHAIN_API_URL}/register-document`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/octet-stream",
      },
      body: fileBytes,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Blockchain document registration failed."
    );
  }

  return result as BlockchainRegistration;
}

export async function verifyDocumentHash(
  documentId: string,
  contentHash: string
): Promise<{ valid: boolean }> {
  const response = await fetch(
    `${BLOCKCHAIN_API_URL}/verify/${documentId}/${contentHash}`
  );

  if (!response.ok) {
    throw new Error("Blockchain verification request failed.");
  }

  return response.json();
}


export type IntegrityVerification = {
  status: "verified" | "mismatch" | "not_registered" | "error";
  documentId: string;
  actualHash?: string;
  registeredHash?: string;
  owner?: string;
  valid: boolean;
  network?: string;
};

export async function verifyStoredDocument(
  documentId: string,
  storagePath: string
): Promise<IntegrityVerification> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Please sign in before verifying a document.");
  }

  // Download the real file using the signed-in user's Supabase access.
  const { data: file, error: downloadError } =
    await supabase.storage.from("documents").download(storagePath);

  if (downloadError || !file) {
    throw new Error("Could not download the document for verification.");
  }

  const fileBytes = await file.arrayBuffer();

  const response = await fetch(
    `${BLOCKCHAIN_API_URL}/verify-document/${documentId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/octet-stream",
      },
      body: fileBytes,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Document verification failed.");
  }

  return result as IntegrityVerification;
}


export type VerifyAnyDocumentResult = {
  network: string;
  contentHash: string;
  documentId: string | null;
  status: "match_found" | "no_match";
  valid: boolean;
};

export async function verifyAnyDocument(
  fileUri: string
): Promise<VerifyAnyDocumentResult> {
  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error("Could not read the selected file.");
  }

  const fileBytes = await response.arrayBuffer();

  const apiResponse = await fetch(
    `${BLOCKCHAIN_API_URL}/verify-any-document`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: fileBytes,
    }
  );

  const result = await apiResponse.json();

  if (!apiResponse.ok) {
    throw new Error(
      result.error || "Blockchain verification request failed."
    );
  }

  return result as VerifyAnyDocumentResult;
}
