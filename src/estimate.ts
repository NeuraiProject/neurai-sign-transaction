import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import type { IUTXO, SupportedNetwork } from "./shared";

// Worst-case witness item sizes for a PQ AuthScript spend with the default
// OP_TRUE witnessScript and no functional args. These match the witness stack
// produced in `shared.ts` for `PQ_AUTHSCRIPT_TYPE`.
const PQ_AUTH_TYPE_BYTES = 1;
const PQ_SIGNATURE_BYTES = 2421; // ml_dsa44 signature (2420) + sighash type byte
const PQ_SERIALIZED_PUBKEY_BYTES = 1313; // 1-byte header + 1312-byte pubkey
const PQ_DEFAULT_WITNESS_SCRIPT_BYTES = 1; // OP_TRUE

// Worst-case scriptSig for a P2PKH legacy spend. Signatures are DER-encoded
// and vary 70-72 bytes; we always assume the maximum so fee estimates round up.
const LEGACY_SIGNATURE_BYTES = 73; // 72-byte DER signature + sighash type byte
const LEGACY_PUBKEY_BYTES = 33; // compressed secp256k1 pubkey

/**
 * Per-component byte sizes used across the Neurai stack for fee estimation.
 *
 * `*Vbytes` values are weight-adjusted (the unit miners actually use). `*Bytes`
 * values are raw serialized bytes (only useful for non-witness components).
 */
export const VBYTES = {
  /** Raw transaction overhead: version (4) + in-count varint (1) + out-count varint (1) + locktime (4). */
  baseTxOverheadBytes: 10,
  /**
   * Extra weight contributed by the segwit marker + flag bytes when the
   * transaction has at least one PQ input. (2 bytes / 4 weight units = 0.5,
   * rounded up to 1 vbyte to be safe.)
   */
  segwitMarkerVbytes: 1,
  /** vbytes contributed by a typical legacy P2PKH input (worst-case scriptSig). */
  legacyInputVbytes: 148,
  /** vbytes contributed by a typical PQ AuthScript input with a default OP_TRUE witnessScript. */
  pqInputVbytes: 977,
  /** Raw bytes of a legacy P2PKH output: 8-byte value + 1-byte script length + 25-byte scriptPubKey. */
  legacyOutputBytes: 34,
  /** Raw bytes of an AuthScript-v1 output: 8-byte value + 1-byte script length + 34-byte scriptPubKey. */
  pqOutputBytes: 43,
} as const;

/**
 * Returns true when the address belongs to a Neurai PQ (AuthScript v1) bech32
 * destination. PQ HRPs are `nq` (mainnet) and `tnq` (testnet).
 */
export function isPQAddress(address: string): boolean {
  return (
    typeof address === "string" &&
    (address.startsWith("nq1") || address.startsWith("tnq1"))
  );
}

/**
 * Returns true when the hex-encoded scriptPubKey is an AuthScript-v1 output
 * (witness v1 with a 32-byte program). Asset-wrapped variants share the same
 * 34-byte prefix so they are also detected as PQ.
 */
export function isPQScript(scriptHex: string): boolean {
  if (typeof scriptHex !== "string" || scriptHex.length < 4) return false;
  // OP_1 (0x51) + push-32 (0x20) prefix.
  return scriptHex.toLowerCase().startsWith("5120");
}

/**
 * Estimate the vbytes contributed by spending a single UTXO. Uses the UTXO's
 * `script` if available (most accurate), otherwise falls back to its `address`.
 * Unknown prevouts are treated as legacy.
 */
export function estimateInputVbytes(
  utxo: Pick<IUTXO, "script" | "address"> | { script?: string; address?: string },
): number {
  const script = (utxo as { script?: string }).script;
  if (typeof script === "string" && script.length > 0) {
    return isPQScript(script) ? VBYTES.pqInputVbytes : VBYTES.legacyInputVbytes;
  }
  const address = (utxo as { address?: string }).address;
  if (typeof address === "string" && isPQAddress(address)) {
    return VBYTES.pqInputVbytes;
  }
  return VBYTES.legacyInputVbytes;
}

/**
 * Estimate the raw bytes contributed by an output, given either its address or
 * a `{ address }` descriptor. Outputs are non-witness, so vbytes equal bytes.
 */
export function estimateOutputBytes(
  target: string | { address?: string },
): number {
  const address =
    typeof target === "string" ? target : (target && target.address) || "";
  return isPQAddress(address) ? VBYTES.pqOutputBytes : VBYTES.legacyOutputBytes;
}

/**
 * Quick fee-estimation helper. Sums the per-input/per-output contributions for
 * an unsigned transaction described by its inputs (UTXO-like) and outputs
 * (address strings or `{address}`). Includes base overhead and segwit marker.
 *
 * For an exact size, prefer {@link estimateVirtualSize}.
 */
export function estimateTransactionVbytes(
  inputs: ReadonlyArray<Pick<IUTXO, "script" | "address"> | { script?: string; address?: string }>,
  outputs: ReadonlyArray<string | { address?: string }>,
): number {
  let vbytes = VBYTES.baseTxOverheadBytes;
  let hasPQInput = false;

  for (const inp of inputs) {
    const v = estimateInputVbytes(inp);
    vbytes += v;
    if (v === VBYTES.pqInputVbytes) hasPQInput = true;
  }

  for (const out of outputs) {
    vbytes += estimateOutputBytes(out);
  }

  if (hasPQInput) vbytes += VBYTES.segwitMarkerVbytes;

  return vbytes;
}

function utxoKey(txid: string, outputIndex: number): string {
  return `${txid}:${outputIndex}`;
}

function buildUTXOMap(utxos: ReadonlyArray<IUTXO>): Map<string, IUTXO> {
  return new Map(utxos.map((u) => [utxoKey(u.txid, u.outputIndex), u]));
}

/**
 * Compute the post-signing virtual size of an unsigned raw transaction by
 * filling each input with a worst-case dummy scriptSig/witness based on the
 * provided UTXO set. Returns vbytes as bitcoinjs-lib's `tx.virtualSize()`.
 *
 * No actual signing is performed; this is safe to call cheaply (no PQ key
 * material involved). Use this to compute an exact fee before signing.
 *
 * The `network` parameter is accepted for API symmetry with `sign()` but is
 * not currently required (script types are inferred from the UTXO scripts).
 */
export function estimateVirtualSize(
  _network: SupportedNetwork,
  rawTransactionHex: string,
  utxos: ReadonlyArray<IUTXO>,
): number {
  const unsignedTx = bitcoin.Transaction.fromHex(rawTransactionHex);

  const tx = new bitcoin.Transaction();
  tx.version = unsignedTx.version;
  tx.locktime = unsignedTx.locktime;

  for (let i = 0; i < unsignedTx.ins.length; i++) {
    const input = unsignedTx.ins[i];
    tx.addInput(Buffer.from(input.hash), input.index, input.sequence);
  }

  for (const out of unsignedTx.outs) {
    tx.addOutput(out.script, out.value);
  }

  const utxoMap = buildUTXOMap(utxos);

  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;
    const utxo = utxoMap.get(utxoKey(txid, vout));

    if (!utxo) {
      // Caller did not supply a UTXO for this input. Assume legacy P2PKH —
      // the signer would skip this input too, but for size estimation the
      // worst-case legacy scriptSig is the safer default than nothing.
      tx.setInputScript(i, dummyLegacyScriptSig());
      continue;
    }

    if (isPQScript(utxo.script)) {
      tx.setInputScript(i, Buffer.alloc(0));
      tx.setWitness(i, dummyPQWitness());
    } else {
      tx.setInputScript(i, dummyLegacyScriptSig());
    }
  }

  return tx.virtualSize();
}

function dummyLegacyScriptSig(): Buffer {
  // Two pushes: <signature+hashType> <pubkey>
  const sig = Buffer.alloc(LEGACY_SIGNATURE_BYTES);
  const pub = Buffer.alloc(LEGACY_PUBKEY_BYTES);
  return Buffer.concat([
    Buffer.from([sig.length]),
    sig,
    Buffer.from([pub.length]),
    pub,
  ]);
}

function dummyPQWitness(): Buffer[] {
  return [
    Buffer.alloc(PQ_AUTH_TYPE_BYTES),
    Buffer.alloc(PQ_SIGNATURE_BYTES),
    Buffer.alloc(PQ_SERIALIZED_PUBKEY_BYTES),
    Buffer.alloc(PQ_DEFAULT_WITNESS_SCRIPT_BYTES),
  ];
}
