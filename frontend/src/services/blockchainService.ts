
import { supabase } from "@/lib/supabase";

const BLOCKCHAIN_API_URL = "http://localhost:3001";

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
