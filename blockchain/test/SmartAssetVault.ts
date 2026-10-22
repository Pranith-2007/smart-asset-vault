
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther, keccak256, toBytes, zeroAddress } from "viem";

describe("SmartAssetVault", async () => {
  const { viem } = await network.connect();

  const [owner, recipient, stranger] = await viem.getWalletClients();

  const documentId = keccak256(toBytes("document-001"));
  const contentHash = keccak256(toBytes("example-document-content"));
  const tamperedHash = keccak256(toBytes("modified-document-content"));

  async function deployVault() {
    return viem.deployContract("SmartAssetVault");
  }

  it("registers a document and verifies its hash", async () => {
    const vault = await deployVault();

    await vault.write.registerDocument([documentId, contentHash]);

    const doc = await vault.read.getDocument([documentId]);
    assert.equal(doc[0].toLowerCase(), owner.account.address.toLowerCase());
    assert.equal(doc[1], contentHash);
    assert.equal(doc[2], true);

    assert.equal(
      await vault.read.verifyDocument([documentId, contentHash]),
      true
    );
    assert.equal(
      await vault.read.verifyDocument([documentId, tamperedHash]),
      false
    );
  });

  it("allows the owner to grant and revoke sharing", async () => {
    const vault = await deployVault();

    await vault.write.registerDocument([documentId, contentHash]);
    await vault.write.setShare([
      documentId,
      recipient.account.address,
      true
    ]);

    assert.equal(
      await vault.read.canAccess([documentId, recipient.account.address]),
      true
    );

    await vault.write.setShare([
      documentId,
      recipient.account.address,
      false
    ]);

    assert.equal(
      await vault.read.canAccess([documentId, recipient.account.address]),
      false
    );
  });

  it("prevents another account from changing sharing permissions", async () => {
    const vault = await deployVault();

    await vault.write.registerDocument([documentId, contentHash]);

    const strangerVault = await viem.getContractAt(
      "SmartAssetVault",
      vault.address,
      { client: { wallet: stranger } }
    );

    await assert.rejects(
      strangerVault.write.setShare([
        documentId,
        recipient.account.address,
        true
      ])
    );
  });
    it("finds a registered document by its content hash", async () => {
    const vault = await deployVault();

    await vault.write.registerDocument([documentId, contentHash]);

    const result = await vault.read.findDocumentByHash([contentHash]);

    assert.equal(result[0], documentId);
    assert.equal(result[1], true);
  });

  it("returns false for an unregistered content hash", async () => {
    const vault = await deployVault();

    const unknownHash = keccak256(toBytes("unknown-document"));

    const result = await vault.read.findDocumentByHash([unknownHash]);

    assert.equal(result[1], false);
  });
});
