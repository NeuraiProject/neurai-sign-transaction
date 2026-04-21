/**
 * JavaScript mirror of Neurai's `OP_TXHASH(selector)` consensus opcode.
 *
 * The algorithm follows the BIP143-style convention used by Bitcoin Core:
 * the "aggregate" selector bits (`INPUT_PREVOUTS`, `INPUT_SEQUENCES`,
 * `OUTPUTS`) are materialised as SHA-256d sub-hashes of the concatenated
 * per-input / per-output fields; the "scalar" bits contribute their raw
 * little-endian serialisation. The outer `buffer` is then SHA-256d'd to
 * produce the 32-byte value that the consensus interpreter pushes onto the
 * stack when `OP_TXHASH` runs.
 *
 * Authoritative reference: `blockchain/Neurai/src/script/interpreter.cpp`
 * (`case OP_TXHASH`). The plan that drives this file — with byte-exact
 * layout table per bit — is
 * `lib/plan-frente-b-covenant-cancel-v2.md §3.6`.
 *
 * Invariant: the bits are consumed in **ascending numeric order** (0x01,
 * 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80). Changing the order here —
 * even for bits that would otherwise commute — produces a different final
 * digest and therefore an invalid signature.
 */

import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";

export const TXHASH_VERSION = 0x01;
export const TXHASH_LOCKTIME = 0x02;
export const TXHASH_INPUT_PREVOUTS = 0x04;
export const TXHASH_INPUT_SEQUENCES = 0x08;
export const TXHASH_OUTPUTS = 0x10;
export const TXHASH_CURRENT_PREVOUT = 0x20;
export const TXHASH_CURRENT_SEQUENCE = 0x40;
export const TXHASH_CURRENT_INDEX = 0x80;
export const TXHASH_ALL = 0xff;

/**
 * Bits (in ascending numeric order) whose contribution is a SHA-256d
 * sub-hash rather than raw bytes.
 */
const AGGREGATE_BITS = new Set<number>([
  TXHASH_INPUT_PREVOUTS,
  TXHASH_INPUT_SEQUENCES,
  TXHASH_OUTPUTS,
]);

function hash256(buf: Buffer): Buffer {
  return Buffer.from(bitcoin.crypto.hash256(buf));
}

function writeUInt64LE(target: Buffer, value: bigint, offset: number): void {
  const normalized = BigInt.asUintN(64, value);
  target.writeUInt32LE(Number(normalized & 0xffffffffn), offset);
  target.writeUInt32LE(Number((normalized >> 32n) & 0xffffffffn), offset + 4);
}

function encodeVarInt(value: number): Buffer {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid varint value: ${value}`);
  }
  if (value < 0xfd) return Buffer.from([value]);
  if (value <= 0xffff) {
    const out = Buffer.alloc(3);
    out[0] = 0xfd;
    out.writeUInt16LE(value, 1);
    return out;
  }
  if (value <= 0xffffffff) {
    const out = Buffer.alloc(5);
    out[0] = 0xfe;
    out.writeUInt32LE(value, 1);
    return out;
  }
  const out = Buffer.alloc(9);
  out[0] = 0xff;
  writeUInt64LE(out, BigInt(value), 1);
  return out;
}

function encodeVarSlice(buffer: Buffer): Buffer {
  return Buffer.concat([encodeVarInt(buffer.length), buffer]);
}

function outpoint(input: bitcoin.Transaction["ins"][number]): Buffer {
  const idx = Buffer.alloc(4);
  idx.writeUInt32LE(input.index, 0);
  return Buffer.concat([Buffer.from(input.hash), idx]);
}

function sequenceBytes(input: bitcoin.Transaction["ins"][number]): Buffer {
  const seq = Buffer.alloc(4);
  seq.writeUInt32LE(input.sequence, 0);
  return seq;
}

function outputBytes(output: bitcoin.Transaction["outs"][number]): Buffer {
  const value = Buffer.alloc(8);
  writeUInt64LE(value, BigInt(output.value), 0);
  return Buffer.concat([value, encodeVarSlice(output.script)]);
}

function versionBytes(tx: bitcoin.Transaction): Buffer {
  const b = Buffer.alloc(4);
  b.writeInt32LE(tx.version, 0);
  return b;
}

function locktimeBytes(tx: bitcoin.Transaction): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(tx.locktime, 0);
  return b;
}

function uint32LE(value: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value, 0);
  return b;
}

/**
 * Contribution of a single set bit to the outer hash buffer. Each handler
 * returns the bytes that the consensus interpreter concatenates into the
 * preimage at this bit's position.
 */
function contributionFor(
  tx: bitcoin.Transaction,
  bit: number,
  inIndex: number
): Buffer {
  switch (bit) {
    case TXHASH_VERSION:
      return versionBytes(tx);
    case TXHASH_LOCKTIME:
      return locktimeBytes(tx);
    case TXHASH_INPUT_PREVOUTS:
      return hash256(Buffer.concat(tx.ins.map(outpoint)));
    case TXHASH_INPUT_SEQUENCES:
      return hash256(Buffer.concat(tx.ins.map(sequenceBytes)));
    case TXHASH_OUTPUTS:
      return hash256(Buffer.concat(tx.outs.map(outputBytes)));
    case TXHASH_CURRENT_PREVOUT:
      if (inIndex < 0 || inIndex >= tx.ins.length) {
        throw new Error(`computeOpTxHash: inIndex ${inIndex} out of range`);
      }
      return outpoint(tx.ins[inIndex]);
    case TXHASH_CURRENT_SEQUENCE:
      if (inIndex < 0 || inIndex >= tx.ins.length) {
        throw new Error(`computeOpTxHash: inIndex ${inIndex} out of range`);
      }
      return sequenceBytes(tx.ins[inIndex]);
    case TXHASH_CURRENT_INDEX:
      return uint32LE(inIndex);
    default:
      throw new Error(`computeOpTxHash: unexpected bit 0x${bit.toString(16)}`);
  }
}

export interface ComputeOpTxHashOptions {
  /**
   * Capture the pre-outer-hash preimage buffer for diagnostics. When
   * callers pass an array, it receives `{ bit, contribution }` entries in
   * processing order. Useful for debugging a consensus mismatch without
   * re-instrumenting the library.
   */
  diagnostics?: Array<{ bit: number; contribution: Buffer }>;
}

/**
 * Compute the 32-byte value consensus would push via `OP_TXHASH(selector)`
 * when the current input being validated is at `inIndex`.
 *
 * `selector` is an 8-bit mask. Bits are processed in ascending numeric
 * order; each set bit contributes its payload (raw scalar or BIP143-style
 * SHA-256d sub-hash) to the outer preimage, which is then SHA-256d'd.
 */
export function computeOpTxHash(
  tx: bitcoin.Transaction,
  selector: number,
  inIndex: number,
  options?: ComputeOpTxHashOptions
): Buffer {
  if (!Number.isInteger(selector) || selector < 0 || selector > 0xff) {
    throw new Error(`computeOpTxHash: selector 0x${selector.toString(16)} out of 8-bit range`);
  }

  const parts: Buffer[] = [];
  for (let bitIdx = 0; bitIdx < 8; bitIdx += 1) {
    const bit = 1 << bitIdx;
    if ((selector & bit) === 0) continue;
    const contribution = contributionFor(tx, bit, inIndex);
    parts.push(contribution);
    options?.diagnostics?.push({ bit, contribution });
  }

  // Consumer note: with selector 0 this returns SHA-256d of the empty
  // buffer. Consensus never evaluates that case (OP_TXHASH requires a
  // non-zero selector on stack per the interpreter), so treating it as a
  // pure function of selector=0 is a deliberate choice to keep the helper
  // total and testable.
  return hash256(Buffer.concat(parts));
}

// Re-export for convenience; the aggregate set is occasionally useful for
// callers that want to pre-compute sub-hashes once.
export { AGGREGATE_BITS };
