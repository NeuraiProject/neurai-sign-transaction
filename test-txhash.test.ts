import { describe, expect, it } from "vitest";
import { Transaction } from "bitcoinjs-lib";
import { Buffer } from "buffer";
import { computeOpTxHash } from "./src/tx-hash";

const NODE_NIP042_DIGEST = "2d2101b4ecee7d8d38993e3bb9c50963819218a57e2f4a7c15004749634f97cd";

function vectorTransaction(): Transaction {
  const tx = new Transaction();
  tx.version = 3;
  tx.addInput(Buffer.alloc(32), 0, 0xffffffff, Buffer.alloc(0));
  tx.addOutput(Buffer.from([0x51]), 100000n);
  return tx;
}

function vectorRefInputs(): Buffer {
  const first = Buffer.from(Array.from({ length: 32 }, (_, i) => i + 64));
  const second = Buffer.from(Array.from({ length: 32 }, (_, i) => i + 96));
  const firstIndex = Buffer.alloc(4);
  const secondIndex = Buffer.alloc(4);
  firstIndex.writeUInt32LE(0x12345678);
  secondIndex.writeUInt32LE(0x87654321);
  return Buffer.concat([first, firstIndex, second, secondIndex]);
}

describe("NIP-042 OP_TXHASH", () => {
  it("matches the node's public CSFS vector for outputs and vrefin", () => {
    const digest = computeOpTxHash(vectorTransaction(), 0x110, 0, {
      refInputs: vectorRefInputs(),
    });
    expect(digest.toString("hex")).toBe(NODE_NIP042_DIGEST);
  });

  it("binds reference outpoints only when bit 8 is selected", () => {
    const tx = vectorTransaction();
    const refs = vectorRefInputs();
    expect(computeOpTxHash(tx, 0x10, 0, { refInputs: refs })).toEqual(
      computeOpTxHash(tx, 0x10, 0, { refInputs: Buffer.alloc(0) })
    );
    expect(computeOpTxHash(tx, 0x110, 0, { refInputs: refs })).not.toEqual(
      computeOpTxHash(tx, 0x110, 0, { refInputs: Buffer.alloc(0) })
    );
  });

  it("requires reference outpoints for a version-3 bit-8 digest", () => {
    expect(() => computeOpTxHash(vectorTransaction(), 0x100, 0)).toThrow(
      /reference outpoints are required/
    );
  });

  it("rejects zero and reserved selector bits", () => {
    const tx = vectorTransaction();
    expect(() => computeOpTxHash(tx, 0, 0)).toThrow(/NIP-042 range/);
    expect(() => computeOpTxHash(tx, 0x200, 0)).toThrow(/NIP-042 range/);
  });
});
