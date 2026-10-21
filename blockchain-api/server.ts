import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { readFile } from "node:fs/promises";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPublicClient, http, getAddress } from "viem";
import { sepolia } from "viem/chains";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const supabaseAuth = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function requireSupabaseUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired session." });
      return;
    }

    res.locals.user = data.user;
    next();
  } catch {
    res.status(401).json({ error: "Could not validate session." });
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const contractAddress = getAddress(
  "0xedc18a1674a9959a7658442b56a889ab7b6a1958"
);

const artifactPath = resolve(
  process.cwd(),
  "../blockchain/artifacts/contracts/SmartAssetVault.sol/SmartAssetVault.json"
);

const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});

const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

if (
  !privateKey ||
  !/^0x[0-9a-fA-F]{64}$/.test(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  )
) {
  throw new Error(
    "SEPOLIA_PRIVATE_KEY is missing or invalid in blockchain-api/.env"
  );
}

const normalizedKey = (
  privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
) as `0x${string}`;

const account = privateKeyToAccount(normalizedKey);

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Smart Asset Vault Blockchain API",
  });
});

app.get("/contract", async (_req, res) => {
  try {
    const chainId = await publicClient.getChainId();
    const code = await publicClient.getCode({
      address: contractAddress,
    });

    res.json({
      network: "sepolia",
      chainId,
      contractAddress,
      deployed: Boolean(code && code !== "0x"),
      abiFunctions: artifact.abi
        .filter((item: { type: string }) => item.type === "function")
        .map((item: { name?: string }) => item.name),
    });
  } catch (error) {
    console.error("Contract check failed:", error);
    res.status(500).json({
      error: "Could not connect to the Sepolia contract.",
    });
  }
});

app.get("/verify/:documentId/:contentHash", async (req, res) => {
  try {
    const { documentId, contentHash } = req.params;

    if (
      !/^0x[0-9a-fA-F]{64}$/.test(documentId) ||
      !/^0x[0-9a-fA-F]{64}$/.test(contentHash)
    ) {
      res.status(400).json({
        error: "documentId and contentHash must each be 32-byte hex values prefixed with 0x.",
      });
      return;
    }

    const valid = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "verifyDocument",
      args: [documentId as `0x${string}`, contentHash as `0x${string}`],
    });

    res.json({
      network: "sepolia",
      documentId,
      contentHash,
      valid,
    });
  } catch (error) {
    console.error("Document verification failed:", error);
    res.status(500).json({
      error: "Could not verify the document against the blockchain.",
    });
  }
});


app.get("/hash-test", async (_req, res) => {
  try {
    const filePath = resolve(process.cwd(), "test-document.txt");
    const file = await readFile(filePath);

    const sha256 = createHash("sha256")
      .update(file)
      .digest("hex");

    res.json({
      file: "test-document.txt",
      algorithm: "SHA-256",
      hash: sha256,
      matchesExpected:
        sha256.toUpperCase() ===
        "5096535A47870E21F8AF1D96BFF95AEE9AF9107968FA8B7A5EB1A05248CEDC85",
    });
  } catch (error) {
    console.error("File hashing failed:", error);
    res.status(500).json({ error: "Could not hash the test file." });
  }
});


app.post("/register-test-document",requireSupabaseUser, async (_req, res) => {
  try {
    const filePath = resolve(process.cwd(), "test-document.txt");
    const file = await readFile(filePath);

    const contentHash = `0x${createHash("sha256")
      .update(file)
      .digest("hex")}` as `0x${string}`;

    const documentId = `0x${createHash("sha256")
      .update("smart-asset-vault-local-test-document")
      .digest("hex")}` as `0x${string}`;

    const existing = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "getDocument",
      args: [documentId],
    });

    if (existing[2]) {
      res.status(409).json({
        error: "This test document is already registered.",
        documentId,
        contentHash,
      });
      return;
    }

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "registerDocument",
      args: [documentId, contentHash],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    res.json({
      status: receipt.status,
      network: "sepolia",
      documentId,
      contentHash,
      transactionHash: txHash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error) {
    console.error("Test registration failed:", error);
    res.status(500).json({
      error: "Test document registration failed.",
    });
  }
});


app.post(
  "/register-document",requireSupabaseUser,
  express.raw({ type: "application/octet-stream", limit: "25mb" }),
  async (req, res) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "Document bytes are required." });
        return;
      }

      const fileBytes = req.body as Buffer;

      const contentHash = `0x${createHash("sha256")
        .update(fileBytes)
        .digest("hex")}` as `0x${string}`;

      // Generate an opaque ID for this registration.
      const documentId = `0x${createHash("sha256")
        .update(`${contentHash}:${Date.now()}:${Math.random()}`)
        .digest("hex")}` as `0x${string}`;

      const txHash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "registerDocument",
        args: [documentId, contentHash],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status !== "success") {
        res.status(502).json({ error: "Blockchain transaction failed." });
        return;
      }

      res.json({
        network: "sepolia",
        documentId,
        contentHash,
        transactionHash: txHash,
        blockNumber: receipt.blockNumber.toString(),
        status: receipt.status,
      });
    } catch (error) {
      console.error("Document registration failed:", error);
      res.status(500).json({
        error: "Document registration failed.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Blockchain API running at http://localhost:${PORT}`);
});
